/**
 * REFiND Map Service
 *
 * Provides geospatial data for the interactive map:
 * - GeoJSON feature collections for map rendering
 * - Heat zone data for density visualization
 * - Viewport-based loading with clustering
 * - Route buffer zone generation
 * - Reverse geocoding for location names
 */

import { getAdminClient } from '../config/supabase.js';
import { getRedis } from '../config/redis.js';
import type {
  GeoJSONFeatureCollection,
  GeoBounds,
  PostType,
  PostCategory,
  HeatZoneData,
  GeoPoint,
} from '@refind/shared';

// ============================================================
// MAP POSTS (GeoJSON)
// ============================================================

interface MapPostsQuery {
  bounds: GeoBounds;
  type?: PostType;
  category?: PostCategory;
  limit?: number;
}

/**
 * Get posts as GeoJSON FeatureCollection for map rendering.
 * Uses the database function `get_posts_geojson` for optimal performance.
 *
 * Results are cached per viewport (rounded bounds) for 60 seconds.
 */
export async function getMapPosts(
  query: MapPostsQuery
): Promise<GeoJSONFeatureCollection> {
  const { bounds, type, category, limit = 500 } = query;

  // Round bounds to reduce cache variance (snap to ~100m grid)
  const roundedBounds = {
    sw: { lng: roundCoord(bounds.sw.lng), lat: roundCoord(bounds.sw.lat) },
    ne: { lng: roundCoord(bounds.ne.lng), lat: roundCoord(bounds.ne.lat) },
  };

  // Check cache
  const cacheKey = `map:posts:${JSON.stringify(roundedBounds)}:${type ?? 'all'}:${category ?? 'all'}`;
  const redis = getRedis();

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Cache miss, proceed with query
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase.rpc('get_posts_geojson', {
    p_bounds_sw_lng: roundedBounds.sw.lng,
    p_bounds_sw_lat: roundedBounds.sw.lat,
    p_bounds_ne_lng: roundedBounds.ne.lng,
    p_bounds_ne_lat: roundedBounds.ne.lat,
    p_type: type ?? null,
    p_category: category ?? null,
    p_limit: limit,
  });

  if (error) {
    console.error('[MapService] GeoJSON query failed:', error.message);
    return { type: 'FeatureCollection', features: [] };
  }

  const result = data as GeoJSONFeatureCollection;

  // Cache for 60 seconds
  try {
    await redis.setex(cacheKey, 60, JSON.stringify(result));
  } catch {
    // Non-critical
  }

  return result;
}

// ============================================================
// HEAT ZONES
// ============================================================

/**
 * Get heat zone data for density visualization.
 * Returns grid cells with aggregated post counts.
 *
 * Cached for 15 minutes (heat zones are slow-changing).
 */
export async function getHeatZones(
  days = 30,
  minCount = 3
): Promise<HeatZoneData[]> {
  const cacheKey = `map:heat:${days}:${minCount}`;
  const redis = getRedis();

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Cache miss
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase.rpc('get_heat_zones', {
    p_days: days,
    p_min_count: minCount,
  });

  if (error) {
    console.error('[MapService] Heat zone query failed:', error.message);
    return [];
  }

  const result = (data ?? []) as HeatZoneData[];

  // Cache for 15 minutes
  try {
    await redis.setex(cacheKey, 900, JSON.stringify(result));
  } catch {
    // Non-critical
  }

  return result;
}

// ============================================================
// NEARBY POSTS
// ============================================================

/**
 * Get posts near a specific point, sorted by distance.
 * Used for "nearby" feed and radius-based search.
 */
export async function getNearbyPosts(
  center: GeoPoint,
  radiusMeters: number,
  options?: {
    type?: PostType;
    category?: PostCategory;
    limit?: number;
    offset?: number;
  }
): Promise<{
  posts: Array<{
    id: string;
    distanceMeters: number;
    type: PostType;
    category: PostCategory;
    title: string;
    thumbnailUrl: string | null;
    createdAt: string;
  }>;
  total: number;
}> {
  const supabase = getAdminClient();
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  // Build the query using PostGIS
  let query = supabase
    .from('posts')
    .select(`
      id, type, category, title, created_at,
      post_images(thumbnail_url)
    `, { count: 'exact' })
    .eq('status', 'active');

  if (options?.type) query = query.eq('type', options.type);
  if (options?.category) query = query.eq('category', options.category);

  // Note: Proper PostGIS distance filtering needs to be done via RPC
  // This is a simplified version for the initial implementation
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[MapService] Nearby query failed:', error.message);
    return { posts: [], total: 0 };
  }

  return {
    posts: (data ?? []).map((post) => ({
      id: post.id,
      distanceMeters: 0, // Would be computed by PostGIS in production RPC
      type: post.type as PostType,
      category: post.category as PostCategory,
      title: post.title,
      thumbnailUrl: (post.post_images as Array<{ thumbnail_url: string }>)?.[0]?.thumbnail_url ?? null,
      createdAt: post.created_at,
    })),
    total: count ?? 0,
  };
}

// ============================================================
// ROUTE BUFFER
// ============================================================

/**
 * Generate a buffer zone around a user-drawn route.
 * Used to find found items along a path the user traveled.
 *
 * @param routePoints Array of points defining the route
 * @param bufferMeters Buffer distance in meters (default 50m each side)
 * @returns Array of found post IDs within the buffer zone
 */
export async function findPostsAlongRoute(
  routePoints: GeoPoint[],
  bufferMeters = 50,
  category?: PostCategory
): Promise<string[]> {
  if (routePoints.length < 2) return [];

  const supabase = getAdminClient();

  // Build LineString WKT from route points
  const lineCoords = routePoints.map((p) => `${p.lng} ${p.lat}`).join(',');
  const lineWkt = `LINESTRING(${lineCoords})`;

  // Query posts within buffer of the route line
  const { data, error } = await supabase.rpc('find_posts_along_route', {
    p_route_wkt: lineWkt,
    p_buffer_meters: bufferMeters,
    p_category: category ?? null,
  });

  if (error) {
    console.error('[MapService] Route buffer query failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: { id: string }) => row.id);
}

// ============================================================
// REVERSE GEOCODING
// ============================================================

/**
 * Get a human-readable address from coordinates.
 * Uses Mapbox Geocoding API with caching.
 */
export async function reverseGeocode(
  point: GeoPoint
): Promise<string | null> {
  const cacheKey = `geo:reverse:${roundCoord(point.lng)}:${roundCoord(point.lat)}`;
  const redis = getRedis();

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch {
    // Cache miss
  }

  try {
    const env = (await import('../config/env.js')).getEnv();
    if (!env.MAPBOX_ACCESS_TOKEN) return null;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${point.lng},${point.lat}.json?access_token=${env.MAPBOX_ACCESS_TOKEN}&language=ro,en&limit=1&types=address,place`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as { features?: Array<{ place_name?: string }> };
    const placeName = data.features?.[0]?.place_name ?? null;

    if (placeName) {
      try {
        await redis.setex(cacheKey, 86400, placeName); // Cache 24h
      } catch {
        // Non-critical
      }
    }

    return placeName;
  } catch (err) {
    console.error('[MapService] Reverse geocode failed:', err);
    return null;
  }
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Round coordinate to ~100m precision for cache key stability.
 */
function roundCoord(coord: number): number {
  return Math.round(coord * 1000) / 1000;
}

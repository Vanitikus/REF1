/**
 * Map Routes
 *
 * GET  /map/posts       — GeoJSON posts for map rendering
 * GET  /map/heat-zones  — Heat zone data for density overlay
 * GET  /map/nearby      — Nearby posts by distance
 * POST /map/route-search — Find posts along a route
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getMapPosts, getHeatZones, getNearbyPosts, findPostsAlongRoute } from '../../services/map-service.js';
import type { PostType, PostCategory } from '@refind/shared';

const boundsSchema = z.object({
  swLng: z.coerce.number().min(-180).max(180),
  swLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  type: z.enum(['lost', 'found']).optional(),
  category: z.enum(['pet', 'object', 'document', 'other']).optional(),
  limit: z.coerce.number().min(1).max(1000).default(500),
});

const nearbySchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  type: z.enum(['lost', 'found']).optional(),
  category: z.enum(['pet', 'object', 'document', 'other']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const routeSearchSchema = z.object({
  points: z.array(z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
  })).min(2),
  bufferMeters: z.number().min(10).max(500).default(50),
  category: z.enum(['pet', 'object', 'document', 'other']).optional(),
});

export async function mapRoutes(app: FastifyInstance): Promise<void> {
  app.get('/posts', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = boundsSchema.parse(request.query);

    const data = await getMapPosts({
      bounds: {
        sw: { lng: query.swLng, lat: query.swLat },
        ne: { lng: query.neLng, lat: query.neLat },
      },
      type: query.type as PostType | undefined,
      category: query.category as PostCategory | undefined,
      limit: query.limit,
    });

    return reply.send({ success: true, data });
  });

  app.get('/heat-zones', async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await getHeatZones();
    return reply.send({ success: true, data });
  });

  app.get('/nearby', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = nearbySchema.parse(request.query);

    const data = await getNearbyPosts(
      { lng: query.lng, lat: query.lat },
      query.radius,
      {
        type: query.type as PostType | undefined,
        category: query.category as PostCategory | undefined,
        limit: query.limit,
        offset: query.offset,
      }
    );

    return reply.send({ success: true, data });
  });

  app.post('/route-search', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = routeSearchSchema.parse(request.body);

    const postIds = await findPostsAlongRoute(
      body.points,
      body.bufferMeters,
      body.category as PostCategory | undefined
    );

    return reply.send({ success: true, data: { postIds } });
  });
}

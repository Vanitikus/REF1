/**
 * Post Routes
 *
 * GET    /posts              — List posts (feed with filters)
 * GET    /posts/:id          — Get single post
 * POST   /posts              — Create new post
 * PATCH  /posts/:id          — Update post
 * DELETE /posts/:id          — Delete post
 * POST   /posts/:id/images   — Upload images to post
 * POST   /posts/:id/boost    — Boost post visibility
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAdminClient } from '../../config/supabase.js';
import { classifyImage, generateImageEmbedding, moderateContent } from '../../services/ai-service.js';
import { runMatchingPipeline } from '../../services/matching-engine.js';
import { notifyMatchFound } from '../../services/notification-service.js';
import { reverseGeocode } from '../../services/map-service.js';
import { POST_CONSTRAINTS, RATE_LIMITS } from '@refind/shared';

const createPostSchema = z.object({
  type: z.enum(['lost', 'found']),
  category: z.enum(['pet', 'object', 'document', 'other']),
  title: z.string().min(POST_CONSTRAINTS.titleMinLength).max(POST_CONSTRAINTS.titleMaxLength),
  description: z.string().max(POST_CONSTRAINTS.descriptionMaxLength).optional(),
  location: z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
  }),
  locationName: z.string().optional(),
  routeGeometry: z.array(z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
  })).optional(),
  rewardAmount: z.number().min(0).optional(),
  rewardCurrency: z.string().default('RON'),
  contactPreference: z.enum(['chat', 'phone', 'both']).default('chat'),
});

const updatePostSchema = z.object({
  title: z.string().min(POST_CONSTRAINTS.titleMinLength).max(POST_CONSTRAINTS.titleMaxLength).optional(),
  description: z.string().max(POST_CONSTRAINTS.descriptionMaxLength).optional(),
  status: z.enum(['active', 'resolved', 'expired', 'removed']).optional(),
  rewardAmount: z.number().min(0).optional(),
  contactPreference: z.enum(['chat', 'phone', 'both']).optional(),
});

const listPostsSchema = z.object({
  type: z.enum(['lost', 'found']).optional(),
  category: z.enum(['pet', 'object', 'document', 'other']).optional(),
  status: z.enum(['active', 'resolved', 'expired', 'removed']).optional(),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function postRoutes(app: FastifyInstance): Promise<void> {
  // ── List Posts (Feed) ─────────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listPostsSchema.parse(request.query);
    const supabase = getAdminClient();

    let dbQuery = supabase
      .from('posts')
      .select(`
        id, type, status, category, title, description,
        location, location_name, reward_amount, reward_currency,
        contact_preference, view_count, is_boosted,
        created_at, updated_at, expires_at,
        user:users!posts_user_id_fkey(id, display_name, avatar_url, community_score, is_verified),
        images:post_images(id, original_url, thumbnail_url, display_order)
      `, { count: 'exact' });

    // Apply filters
    if (query.type) dbQuery = dbQuery.eq('type', query.type);
    if (query.category) dbQuery = dbQuery.eq('category', query.category);
    if (query.userId) dbQuery = dbQuery.eq('user_id', query.userId);
    dbQuery = dbQuery.eq('status', query.status ?? 'active');

    // Text search
    if (query.search) {
      dbQuery = dbQuery.textSearch('search_vector', query.search, {
        type: 'websearch',
      });
    }

    // Sort: boosted first, then by creation date
    dbQuery = dbQuery
      .order('is_boosted', { ascending: false })
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    const { data, count, error } = await dbQuery;

    if (error) throw error;

    return reply.send({
      success: true,
      data: {
        data: data ?? [],
        total: count ?? 0,
        limit: query.limit,
        offset: query.offset,
        hasMore: (count ?? 0) > query.offset + query.limit,
      },
    });
  });

  // ── Get Single Post ───────────────────────────────────────
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey(id, display_name, avatar_url, community_score, is_verified),
        images:post_images(id, original_url, thumbnail_url, ai_labels, display_order),
        matches:matches!matches_lost_post_id_fkey(id, confidence_score, status),
        found_matches:matches!matches_found_post_id_fkey(id, confidence_score, status)
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' },
      });
    }

    // Increment view count (fire and forget)
    supabase
      .from('posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', id)
      .then(() => {});

    return reply.send({ success: true, data: post });
  });

  // ── Create Post ───────────────────────────────────────────
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const body = createPostSchema.parse(request.body);
    const supabase = getAdminClient();

    // Reverse geocode if no location name provided
    let locationName = body.locationName;
    if (!locationName) {
      locationName = await reverseGeocode(body.location) ?? undefined;
    }

    // Build PostGIS point
    const pointWkt = `POINT(${body.location.lng} ${body.location.lat})`;

    // Build route geometry if provided
    let routeWkt: string | null = null;
    if (body.routeGeometry && body.routeGeometry.length >= 2) {
      const coords = body.routeGeometry.map((p) => `${p.lng} ${p.lat}`).join(',');
      routeWkt = `LINESTRING(${coords})`;
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: request.userId,
        type: body.type,
        category: body.category,
        title: body.title,
        description: body.description,
        location: pointWkt,
        location_name: locationName,
        route_geometry: routeWkt,
        reward_amount: body.rewardAmount,
        reward_currency: body.rewardCurrency,
        contact_preference: body.contactPreference,
      })
      .select('id, type, status, category, title, created_at')
      .single();

    if (error) throw error;

    // Create reward record if amount specified
    if (body.rewardAmount && body.rewardAmount > 0) {
      await supabase.from('rewards').insert({
        post_id: post.id,
        offered_by: request.userId,
        amount: body.rewardAmount,
        currency: body.rewardCurrency,
      });
    }

    // Run matching pipeline asynchronously
    // In production this would be a background job via BullMQ
    setImmediate(async () => {
      try {
        const matches = await runMatchingPipeline(post.id);
        for (const match of matches) {
          await notifyMatchFound(match);
        }
      } catch (err) {
        console.error('[Posts] Matching pipeline error:', err);
      }
    });

    return reply.status(201).send({ success: true, data: post });
  });

  // ── Update Post ───────────────────────────────────────────
  app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const body = updatePostSchema.parse(request.body);
    const supabase = getAdminClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== request.userId) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only edit your own posts' },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'resolved') updateData.resolved_at = new Date().toISOString();
    }
    if (body.rewardAmount !== undefined) updateData.reward_amount = body.rewardAmount;
    if (body.contactPreference !== undefined) updateData.contact_preference = body.contactPreference;

    const { data: updated, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return reply.send({ success: true, data: updated });
  });

  // ── Delete Post ───────────────────────────────────────────
  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    const { data: existing } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    const isAdmin = request.userRole === 'admin' || request.userRole === 'moderator';
    if (!existing || (existing.user_id !== request.userId && !isAdmin)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this post' },
      });
    }

    // Soft delete: mark as removed
    await supabase
      .from('posts')
      .update({ status: 'removed' })
      .eq('id', id);

    return reply.send({ success: true });
  });

  // ── Upload Images ─────────────────────────────────────────
  app.post('/:id/images', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    // Verify ownership
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!post || post.user_id !== request.userId) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    const parts = request.parts();
    const uploadedImages: Array<{ id: string; url: string; thumbnailUrl: string }> = [];

    for await (const part of parts) {
      if (part.type !== 'file') continue;

      const buffer = await part.toBuffer();

      // Validate file type
      if (!POST_CONSTRAINTS.allowedImageTypes.includes(part.mimetype as typeof POST_CONSTRAINTS.allowedImageTypes[number])) {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_FILE_TYPE', message: `Allowed types: ${POST_CONSTRAINTS.allowedImageTypes.join(', ')}` },
        });
      }

      // Content moderation
      const moderation = await moderateContent(null, buffer, part.mimetype);
      if (!moderation.isSafe) {
        return reply.status(400).send({
          success: false,
          error: { code: 'CONTENT_FLAGGED', message: 'Image flagged by content moderation' },
        });
      }

      // AI classification
      const classification = await classifyImage(buffer, part.mimetype);

      // Generate embedding
      const embedding = await generateImageEmbedding(
        classification.description,
        classification.labels
      );

      // Upload to Supabase Storage
      const fileName = `${id}/${crypto.randomUUID()}.webp`;
      const thumbFileName = `${id}/${crypto.randomUUID()}_thumb.webp`;

      // In production, use sharp to resize/convert to WebP
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, buffer, { contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      const { data: thumbUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(thumbFileName);

      // Create image record
      const { data: image, error: imgError } = await supabase
        .from('post_images')
        .insert({
          post_id: id,
          storage_path: fileName,
          thumbnail_path: thumbFileName,
          original_url: urlData.publicUrl,
          thumbnail_url: thumbUrlData.publicUrl,
          ai_labels: classification.labels,
          ai_embedding: embedding,
          display_order: uploadedImages.length,
        })
        .select('id')
        .single();

      if (imgError) throw imgError;

      // Update post with AI data from first image
      if (uploadedImages.length === 0) {
        await supabase
          .from('posts')
          .update({
            ai_category_suggestion: classification.category,
            ai_labels: classification.labels,
            ai_embedding: embedding,
          })
          .eq('id', id);
      }

      uploadedImages.push({
        id: image.id,
        url: urlData.publicUrl,
        thumbnailUrl: thumbUrlData.publicUrl,
      });
    }

    return reply.status(201).send({ success: true, data: uploadedImages });
  });

  // ── Boost Post ────────────────────────────────────────────
  app.post('/:id/boost', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    // Verify ownership
    const { data: post } = await supabase
      .from('posts')
      .select('user_id, is_boosted')
      .eq('id', id)
      .single();

    if (!post || post.user_id !== request.userId) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    if (post.is_boosted) {
      return reply.status(400).send({
        success: false,
        error: { code: 'ALREADY_BOOSTED', message: 'Post is already boosted' },
      });
    }

    // In production, this would check payment status
    const boostDuration = 24 * 60 * 60 * 1000; // 24 hours
    const boostExpiresAt = new Date(Date.now() + boostDuration).toISOString();

    await supabase
      .from('posts')
      .update({ is_boosted: true, boost_expires_at: boostExpiresAt })
      .eq('id', id);

    return reply.send({ success: true, data: { boostExpiresAt } });
  });
}

/**
 * User Routes
 *
 * GET    /users/me           — Get current user profile
 * PATCH  /users/me           — Update current user
 * GET    /users/:id/profile  — Get public profile
 * DELETE /users/me           — GDPR: delete account and all data
 *
 * POST   /users/me/device-tokens   — Register push notification token
 * DELETE /users/me/device-tokens    — Deactivate push token
 *
 * GET    /users/me/alert-zones     — List alert zones
 * POST   /users/me/alert-zones     — Create alert zone
 * DELETE /users/me/alert-zones/:id — Delete alert zone
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAdminClient } from '../../config/supabase.js';
import { USER_CONSTRAINTS, ALERT_ZONE_DEFAULTS } from '@refind/shared';

const updateUserSchema = z.object({
  displayName: z.string().min(USER_CONSTRAINTS.displayNameMinLength).max(USER_CONSTRAINTS.displayNameMaxLength).optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.enum(['ro', 'en']).optional(),
});

const deviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
});

const alertZoneSchema = z.object({
  center: z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
  }),
  radiusMeters: z.number()
    .min(ALERT_ZONE_DEFAULTS.minRadiusMeters)
    .max(ALERT_ZONE_DEFAULTS.maxRadiusMeters)
    .default(ALERT_ZONE_DEFAULTS.defaultRadiusMeters),
  categories: z.array(z.enum(['pet', 'object', 'document', 'other'])).optional(),
});

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // ── Get Current User ──────────────────────────────────────
  app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const supabase = getAdminClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', request.userId)
      .single();

    if (error || !user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    // Get post counts
    const [{ count: activePosts }, { count: resolvedPosts }] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', request.userId).eq('status', 'active'),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', request.userId).eq('status', 'resolved'),
    ]);

    return reply.send({
      success: true,
      data: {
        ...user,
        activePostsCount: activePosts ?? 0,
        resolvedPostsCount: resolvedPosts ?? 0,
      },
    });
  });

  // ── Update Current User ───────────────────────────────────
  app.patch('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const body = updateUserSchema.parse(request.body);
    const supabase = getAdminClient();

    const updateData: Record<string, unknown> = {};
    if (body.displayName !== undefined) updateData.display_name = body.displayName;
    if (body.avatarUrl !== undefined) updateData.avatar_url = body.avatarUrl;
    if (body.locale !== undefined) updateData.locale = body.locale;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', request.userId)
      .select()
      .single();

    if (error) throw error;

    return reply.send({ success: true, data });
  });

  // ── Get Public Profile ────────────────────────────────────
  app.get('/:id/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, community_score, is_verified, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const [{ count: activePosts }, { count: resolvedPosts }] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', id).eq('status', 'active'),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', id).eq('status', 'resolved'),
    ]);

    return reply.send({
      success: true,
      data: {
        ...user,
        activePostsCount: activePosts ?? 0,
        resolvedPostsCount: resolvedPosts ?? 0,
      },
    });
  });

  // ── GDPR: Delete Account ──────────────────────────────────
  app.delete('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const supabase = getAdminClient();

    // Get auth_id for auth deletion
    const { data: user } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', request.userId)
      .single();

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    // Cascade delete handles most data via FK constraints
    // Additional cleanup for data not covered by cascades:

    // 1. Delete stored images
    // Get user's post IDs first, then fetch images
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', request.userId);

    const postIds = (userPosts ?? []).map((p) => p.id);

    const { data: images } = postIds.length > 0
      ? await supabase
          .from('post_images')
          .select('storage_path, thumbnail_path')
          .in('post_id', postIds)
      : { data: [] as Array<{ storage_path: string; thumbnail_path: string }> };

    if (images) {
      const paths = images.flatMap((img) => [img.storage_path, img.thumbnail_path]);
      if (paths.length > 0) {
        await supabase.storage.from('post-images').remove(paths);
      }
    }

    // 2. Audit the deletion
    await supabase.from('audit_logs').insert({
      actor_id: request.userId,
      action: 'user.delete_account',
      target_type: 'user',
      target_id: request.userId,
      metadata: { gdpr: true },
    });

    // 3. Delete user record (cascades to posts, messages, etc.)
    await supabase.from('users').delete().eq('id', request.userId);

    // 4. Delete auth user
    await supabase.auth.admin.deleteUser(user.auth_id);

    return reply.send({ success: true, data: { deleted: true } });
  });

  // ── Register Device Token ─────────────────────────────────
  app.post('/me/device-tokens', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const body = deviceTokenSchema.parse(request.body);
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('user_device_tokens')
      .upsert(
        {
          user_id: request.userId,
          token: body.token,
          platform: body.platform,
          is_active: true,
        },
        { onConflict: 'user_id,token' }
      )
      .select('id')
      .single();

    if (error) throw error;

    return reply.status(201).send({ success: true, data });
  });

  // ── Alert Zones ───────────────────────────────────────────
  app.get('/me/alert-zones', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('user_alert_zones')
      .select('*')
      .eq('user_id', request.userId)
      .eq('is_active', true);

    if (error) throw error;

    return reply.send({ success: true, data: data ?? [] });
  });

  app.post('/me/alert-zones', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const body = alertZoneSchema.parse(request.body);
    const supabase = getAdminClient();

    // Check zone limit
    const { count } = await supabase
      .from('user_alert_zones')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', request.userId)
      .eq('is_active', true);

    if ((count ?? 0) >= USER_CONSTRAINTS.maxAlertZones) {
      return reply.status(400).send({
        success: false,
        error: { code: 'ZONE_LIMIT', message: `Maximum ${USER_CONSTRAINTS.maxAlertZones} alert zones allowed` },
      });
    }

    const pointWkt = `POINT(${body.center.lng} ${body.center.lat})`;

    const { data, error } = await supabase
      .from('user_alert_zones')
      .insert({
        user_id: request.userId,
        center: pointWkt,
        radius_meters: body.radiusMeters,
        categories: body.categories ?? ['pet', 'object', 'document', 'other'],
      })
      .select('id, radius_meters, categories, is_active, created_at')
      .single();

    if (error) throw error;

    return reply.status(201).send({ success: true, data });
  });

  app.delete('/me/alert-zones/:zoneId', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { zoneId } = request.params as { zoneId: string };
    const supabase = getAdminClient();

    await supabase
      .from('user_alert_zones')
      .update({ is_active: false })
      .eq('id', zoneId)
      .eq('user_id', request.userId);

    return reply.send({ success: true });
  });
}

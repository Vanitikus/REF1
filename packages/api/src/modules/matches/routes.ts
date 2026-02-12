/**
 * Match Routes
 *
 * GET    /matches           — List user's matches
 * GET    /matches/:id       — Get match details
 * POST   /matches/:id/confirm — Confirm a match
 * POST   /matches/:id/reject  — Reject a match
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAdminClient } from '../../config/supabase.js';
import { confirmMatch } from '../../services/matching-engine.js';
import { notifyMatchResolved } from '../../services/notification-service.js';

export async function matchRoutes(app: FastifyInstance): Promise<void> {
  // ── List User's Matches ───────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const supabase = getAdminClient();

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id, confidence_score, match_factors, status,
        confirmed_by_lost, confirmed_by_found,
        created_at, updated_at,
        lost_post:posts!matches_lost_post_id_fkey(
          id, title, type, category, location_name,
          images:post_images(thumbnail_url)
        ),
        found_post:posts!matches_found_post_id_fkey(
          id, title, type, category, location_name,
          images:post_images(thumbnail_url)
        )
      `)
      .or(
        `lost_post_id.in.(select id from posts where user_id = '${request.userId}'),` +
        `found_post_id.in.(select id from posts where user_id = '${request.userId}')`
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    return reply.send({ success: true, data: matches ?? [] });
  });

  // ── Get Match Details ─────────────────────────────────────
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        lost_post:posts!matches_lost_post_id_fkey(
          *, user:users!posts_user_id_fkey(id, display_name, avatar_url),
          images:post_images(id, original_url, thumbnail_url)
        ),
        found_post:posts!matches_found_post_id_fkey(
          *, user:users!posts_user_id_fkey(id, display_name, avatar_url),
          images:post_images(id, original_url, thumbnail_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !match) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Match not found' },
      });
    }

    return reply.send({ success: true, data: match });
  });

  // ── Confirm Match ─────────────────────────────────────────
  app.post('/:id/confirm', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const result = await confirmMatch(id, request.userId);

    if (!result.confirmed) {
      return reply.status(400).send({
        success: false,
        error: { code: 'CONFIRM_FAILED', message: 'Could not confirm this match' },
      });
    }

    // If both parties confirmed, notify and resolve
    if (result.fullyResolved) {
      await notifyMatchResolved(id);
    }

    return reply.send({
      success: true,
      data: { confirmed: true, fullyResolved: result.fullyResolved },
    });
  });

  // ── Reject Match ──────────────────────────────────────────
  app.post('/:id/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('matches')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) throw error;

    return reply.send({ success: true });
  });
}

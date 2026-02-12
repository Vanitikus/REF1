/**
 * Notification Routes
 *
 * GET    /notifications          — List user's notifications
 * PATCH  /notifications/:id/read — Mark notification as read
 * POST   /notifications/read-all — Mark all as read
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAdminClient } from '../../config/supabase.js';
import { markNotificationRead, markAllNotificationsRead, getUnreadCount } from '../../services/notification-service.js';

const listSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  unreadOnly: z.coerce.boolean().default(false),
});

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  // ── List Notifications ────────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const query = listSchema.parse(request.query);
    const supabase = getAdminClient();

    let dbQuery = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.unreadOnly) {
      dbQuery = dbQuery.eq('is_read', false);
    }

    const { data, count, error } = await dbQuery;
    if (error) throw error;

    const unreadCount = await getUnreadCount(request.userId);

    return reply.send({
      success: true,
      data: {
        notifications: data ?? [],
        total: count ?? 0,
        unreadCount,
        limit: query.limit,
        offset: query.offset,
      },
    });
  });

  // ── Mark as Read ──────────────────────────────────────────
  app.patch('/:id/read', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const success = await markNotificationRead(id, request.userId);

    return reply.send({ success });
  });

  // ── Mark All as Read ──────────────────────────────────────
  app.post('/read-all', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const count = await markAllNotificationsRead(request.userId);

    return reply.send({ success: true, data: { markedRead: count } });
  });
}

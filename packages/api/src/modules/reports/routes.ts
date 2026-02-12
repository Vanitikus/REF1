/**
 * Report Routes
 *
 * POST   /reports           — Submit a report
 * GET    /reports           — Admin: list all reports
 * PATCH  /reports/:id       — Admin: update report status
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAdminClient } from '../../config/supabase.js';

const createReportSchema = z.object({
  targetType: z.enum(['post', 'user', 'message']),
  targetId: z.string().uuid(),
  reason: z.enum(['spam', 'inappropriate', 'fraud', 'harassment', 'other']),
  description: z.string().max(1000).optional(),
});

const updateReportSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'resolved', 'dismissed']),
  resolutionNote: z.string().max(1000).optional(),
});

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  // ── Submit Report ─────────────────────────────────────────
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const body = createReportSchema.parse(request.body);
    const supabase = getAdminClient();

    // Check for duplicate report from same user
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', request.userId)
      .eq('target_type', body.targetType)
      .eq('target_id', body.targetId)
      .in('status', ['pending', 'reviewing'])
      .single();

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: { code: 'DUPLICATE_REPORT', message: 'You have already reported this' },
      });
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: request.userId,
        target_type: body.targetType,
        target_id: body.targetId,
        reason: body.reason,
        description: body.description,
      })
      .select('id, status, created_at')
      .single();

    if (error) throw error;

    // Log audit event
    await supabase.from('audit_logs').insert({
      actor_id: request.userId,
      action: 'report.create',
      target_type: body.targetType,
      target_id: body.targetId,
      metadata: { reason: body.reason, reportId: report.id },
    });

    return reply.status(201).send({ success: true, data: report });
  });

  // ── Admin: List Reports ───────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId || !['admin', 'moderator'].includes(request.userRole ?? '')) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
      });
    }

    const { status, limit = '20', offset = '0' } = request.query as Record<string, string>;
    const supabase = getAdminClient();

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey(id, display_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);

    const { data, count, error } = await query;
    if (error) throw error;

    return reply.send({
      success: true,
      data: { reports: data ?? [], total: count ?? 0 },
    });
  });

  // ── Admin: Update Report ──────────────────────────────────
  app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId || !['admin', 'moderator'].includes(request.userRole ?? '')) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
      });
    }

    const { id } = request.params as { id: string };
    const body = updateReportSchema.parse(request.body);
    const supabase = getAdminClient();

    const updateData: Record<string, unknown> = {
      status: body.status,
      moderator_id: request.userId,
    };

    if (body.resolutionNote) updateData.resolution_note = body.resolutionNote;
    if (['resolved', 'dismissed'].includes(body.status)) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: request.userId,
      action: `report.${body.status}`,
      target_type: 'report',
      target_id: id,
      metadata: { resolutionNote: body.resolutionNote },
    });

    return reply.send({ success: true, data });
  });
}

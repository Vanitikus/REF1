/**
 * Chat Routes
 *
 * GET    /conversations                 — List user's conversations
 * GET    /conversations/:id/messages    — Get messages in conversation
 * POST   /conversations/:id/messages    — Send message
 * PATCH  /conversations/:id/close       — Close conversation
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAdminClient } from '../../config/supabase.js';
import { notifyNewMessage } from '../../services/notification-service.js';
import crypto from 'node:crypto';
import { getEnv } from '../../config/env.js';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'system']).default('text'),
});

/**
 * Simple AES-256-GCM encryption for chat messages.
 * In production, consider client-side E2E encryption.
 */
function encryptMessage(text: string): string {
  const env = getEnv();
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex').subarray(0, 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptMessage(encryptedText: string): string {
  const env = getEnv();
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex').subarray(0, 32);
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  // ── List Conversations ────────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const supabase = getAdminClient();

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [request.userId])
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Enrich with participant info and unread counts
    const enriched = await Promise.all(
      (conversations ?? []).map(async (conv) => {
        const otherUserId = conv.participant_ids.find(
          (id: string) => id !== request.userId
        );

        const [{ data: otherUser }, { count: unreadCount }] = await Promise.all([
          supabase
            .from('users')
            .select('id, display_name, avatar_url')
            .eq('id', otherUserId)
            .single(),
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', request.userId)
            .eq('is_read', false),
        ]);

        return {
          ...conv,
          otherParticipant: otherUser,
          unreadCount: unreadCount ?? 0,
        };
      })
    );

    return reply.send({ success: true, data: enriched });
  });

  // ── Get Messages ──────────────────────────────────────────
  app.get('/:id/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const { limit = '50', before } = request.query as { limit?: string; before?: string };
    const supabase = getAdminClient();

    // Verify participation
    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_ids')
      .eq('id', id)
      .single();

    if (!conv || !conv.participant_ids.includes(request.userId)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a participant' },
      });
    }

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;
    if (error) throw error;

    // Decrypt messages
    const decrypted = (messages ?? []).map((msg) => ({
      ...msg,
      content: decryptMessage(msg.content_encrypted),
      content_encrypted: undefined,
    }));

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', id)
      .neq('sender_id', request.userId)
      .eq('is_read', false);

    return reply.send({ success: true, data: decrypted.reverse() });
  });

  // ── Send Message ──────────────────────────────────────────
  app.post('/:id/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const body = sendMessageSchema.parse(request.body);
    const supabase = getAdminClient();

    // Verify participation and conversation is active
    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_ids, status')
      .eq('id', id)
      .single();

    if (!conv || !conv.participant_ids.includes(request.userId)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a participant' },
      });
    }

    if (conv.status !== 'active') {
      return reply.status(400).send({
        success: false,
        error: { code: 'CONVERSATION_CLOSED', message: 'This conversation is closed' },
      });
    }

    // Encrypt and store message
    const encrypted = encryptMessage(body.content);

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: request.userId,
        content_encrypted: encrypted,
        message_type: body.messageType,
      })
      .select('id, sender_id, message_type, is_read, created_at')
      .single();

    if (error) throw error;

    // Notify other participant
    const otherUserId = conv.participant_ids.find(
      (uid: string) => uid !== request.userId
    );

    if (otherUserId) {
      const { data: sender } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', request.userId)
        .single();

      await notifyNewMessage(
        otherUserId,
        sender?.display_name ?? 'Someone',
        id,
        body.content
      );
    }

    return reply.status(201).send({
      success: true,
      data: { ...message, content: body.content },
    });
  });

  // ── Close Conversation ────────────────────────────────────
  app.patch('/:id/close', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', id)
      .contains('participant_ids', [request.userId]);

    if (error) throw error;

    return reply.send({ success: true });
  });
}

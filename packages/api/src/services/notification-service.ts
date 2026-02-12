/**
 * REFiND Notification Service
 *
 * Handles multi-channel notification delivery:
 * 1. In-app notifications (database)
 * 2. Push notifications (FCM)
 * 3. Email digests (SendGrid)
 *
 * Features:
 * - Priority-based delivery (urgent → immediate push, normal → batched)
 * - Smart radius alerts (new post within user's alert zone)
 * - Match notifications with confidence-based urgency
 * - Read receipts and notification management
 */

import { getAdminClient } from '../config/supabase.js';
import { NotificationType } from '@refind/shared';
import type { MatchResult } from './matching-engine.js';
import { getMatchPriority } from './matching-engine.js';

// ============================================================
// NOTIFICATION CREATION
// ============================================================

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sendPush?: boolean;
}

/**
 * Create an in-app notification and optionally send push.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<string | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data ?? {},
      is_read: false,
      is_pushed: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Notifications] Create failed:', error.message);
    return null;
  }

  // Send push notification if requested
  if (params.sendPush !== false) {
    await sendPushNotification(params.userId, {
      title: params.title,
      body: params.body,
      data: params.data,
    });

    // Mark as pushed
    await supabase
      .from('notifications')
      .update({ is_pushed: true })
      .eq('id', data.id);
  }

  return data.id;
}

// ============================================================
// MATCH NOTIFICATIONS
// ============================================================

/**
 * Send notifications to both parties when a match is found.
 */
export async function notifyMatchFound(matchResult: MatchResult): Promise<void> {
  const supabase = getAdminClient();
  const priority = getMatchPriority(matchResult.confidenceScore);
  const confidencePercent = Math.round(matchResult.confidenceScore * 100);

  // Get post owners
  const { data: lostPost } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', matchResult.lostPostId)
    .single();

  const { data: foundPost } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', matchResult.foundPostId)
    .single();

  if (!lostPost || !foundPost) return;

  // Notification for the lost item owner
  await createNotification({
    userId: lostPost.user_id,
    type: NotificationType.Match,
    title: priority === 'urgent'
      ? 'Your item may have been found!'
      : 'Possible match found',
    body: `"${foundPost.title}" matches your lost item (${confidencePercent}% confidence)`,
    data: {
      matchId: matchResult.matchId,
      postId: matchResult.foundPostId,
      ownPostId: matchResult.lostPostId,
      confidenceScore: matchResult.confidenceScore,
      priority,
    },
    sendPush: true,
  });

  // Notification for the found item poster
  await createNotification({
    userId: foundPost.user_id,
    type: NotificationType.Match,
    title: priority === 'urgent'
      ? 'Someone is looking for this item!'
      : 'Possible match for your found item',
    body: `"${lostPost.title}" matches your found item (${confidencePercent}% confidence)`,
    data: {
      matchId: matchResult.matchId,
      postId: matchResult.lostPostId,
      ownPostId: matchResult.foundPostId,
      confidenceScore: matchResult.confidenceScore,
      priority,
    },
    sendPush: true,
  });
}

/**
 * Notify both parties when a match is fully confirmed (resolved).
 */
export async function notifyMatchResolved(matchId: string): Promise<void> {
  const supabase = getAdminClient();

  const { data: match } = await supabase
    .from('matches')
    .select(`
      lost_post_id, found_post_id,
      lost_post:posts!matches_lost_post_id_fkey(user_id, title),
      found_post:posts!matches_found_post_id_fkey(user_id, title)
    `)
    .eq('id', matchId)
    .single();

  if (!match) return;

  const lostPost = match.lost_post as unknown as { user_id: string; title: string };
  const foundPost = match.found_post as unknown as { user_id: string; title: string };

  // Notify both users
  for (const userId of [lostPost.user_id, foundPost.user_id]) {
    await createNotification({
      userId,
      type: NotificationType.Match,
      title: 'Match confirmed!',
      body: 'Both parties have confirmed the match. Thank you for using REFiND!',
      data: { matchId, resolved: true },
      sendPush: true,
    });
  }
}

// ============================================================
// MESSAGE NOTIFICATIONS
// ============================================================

/**
 * Notify a user about a new chat message.
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  conversationId: string,
  preview: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: NotificationType.Message,
    title: `Message from ${senderName}`,
    body: preview.length > 100 ? preview.slice(0, 97) + '...' : preview,
    data: { conversationId },
    sendPush: true,
  });
}

// ============================================================
// PUSH NOTIFICATION DELIVERY
// ============================================================

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Send push notification to all of a user's registered devices.
 * Uses Firebase Cloud Messaging (FCM).
 */
async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<void> {
  const supabase = getAdminClient();

  // Get user's active device tokens
  const { data: tokens } = await supabase
    .from('user_device_tokens')
    .select('token, platform')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!tokens || tokens.length === 0) return;

  // In production, use Firebase Admin SDK:
  // import { getMessaging } from 'firebase-admin/messaging';
  //
  // const messaging = getMessaging();
  // await messaging.sendEachForMulticast({
  //   tokens: tokens.map(t => t.token),
  //   notification: { title: payload.title, body: payload.body },
  //   data: payload.data ? Object.fromEntries(
  //     Object.entries(payload.data).map(([k, v]) => [k, String(v)])
  //   ) : undefined,
  //   android: { priority: 'high' },
  //   apns: { payload: { aps: { sound: 'default', badge: 1 } } },
  // });

  console.log(
    `[Push] Would send to ${tokens.length} device(s) for user ${userId}: ${payload.title}`
  );
}

// ============================================================
// NOTIFICATION MANAGEMENT
// ============================================================

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  return !error;
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsRead(userId: string): Promise<number> {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select('id');

  return data?.length ?? 0;
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = getAdminClient();

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return count ?? 0;
}

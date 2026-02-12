import type { FastifyRequest, FastifyReply } from 'fastify';
import { getAdminClient } from '../config/supabase.js';

/** Routes that don't require authentication */
const PUBLIC_ROUTES = new Set([
  '/health',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/social/google',
  '/auth/social/apple',
]);

/** Routes that allow anonymous access but benefit from auth context */
const OPTIONAL_AUTH_ROUTES = [
  '/posts',
  '/map/',
];

declare module 'fastify' {
  interface FastifyRequest {
    userId: string | null;
    userRole: string | null;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { url, method } = request;

  // Public routes — no auth needed
  if (PUBLIC_ROUTES.has(url.split('?')[0])) {
    return;
  }

  // Extract Bearer token
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // Optional auth routes — proceed without auth but attach user if present
  const isOptionalAuth = OPTIONAL_AUTH_ROUTES.some((r) => url.startsWith(r))
    && method === 'GET';

  if (!token) {
    if (isOptionalAuth) return;
    reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  try {
    const supabase = getAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (isOptionalAuth) return;
      reply.status(401).send({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
      });
      return;
    }

    // Look up internal user record
    const { data: internalUser } = await supabase
      .from('users')
      .select('id, role, is_suspended')
      .eq('auth_id', user.id)
      .single();

    if (internalUser?.is_suspended) {
      reply.status(403).send({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended' },
      });
      return;
    }

    request.userId = internalUser?.id ?? null;
    request.userRole = internalUser?.role ?? null;

    // Update last active timestamp (fire and forget)
    if (internalUser?.id) {
      supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', internalUser.id)
        .then(() => {});
    }
  } catch (err) {
    request.log.error(err, 'Auth middleware error');
    if (isOptionalAuth) return;
    reply.status(500).send({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication service error' },
    });
  }
}

/**
 * Authentication Routes
 *
 * POST /auth/register  — Create account with email/password
 * POST /auth/login     — Sign in with email/password
 * POST /auth/refresh   — Refresh JWT token
 * POST /auth/logout    — Sign out (invalidate session)
 * POST /auth/social/:provider — Social login (Google/Apple)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAdminClient } from '../../config/supabase.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(50),
  locale: z.enum(['ro', 'en']).default('ro'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // ── Register ──────────────────────────────────────────────
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);
    const supabase = getAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return reply.status(409).send({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
        });
      }
      throw authError;
    }

    // Create internal user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email: body.email,
        display_name: body.displayName,
        locale: body.locale,
      })
      .select()
      .single();

    if (userError) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    // Sign in to get tokens
    const { data: session } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          locale: user.locale,
        },
        session: {
          accessToken: session.session?.access_token,
          refreshToken: session.session?.refresh_token,
          expiresAt: session.session?.expires_at,
        },
      },
    });
  });

  // ── Login ─────────────────────────────────────────────────
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);
    const supabase = getAdminClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Get internal user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, display_name, role, locale, avatar_url, community_score, is_verified')
      .eq('auth_id', data.user.id)
      .single();

    return reply.send({
      success: true,
      data: {
        user: user ? {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          locale: user.locale,
          avatarUrl: user.avatar_url,
          communityScore: user.community_score,
          isVerified: user.is_verified,
        } : null,
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
      },
    });
  });

  // ── Refresh Token ─────────────────────────────────────────
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = refreshSchema.parse(request.body);
    const supabase = getAdminClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: body.refreshToken,
    });

    if (error) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' },
      });
    }

    return reply.send({
      success: true,
      data: {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresAt: data.session?.expires_at,
      },
    });
  });

  // ── Logout ────────────────────────────────────────────────
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    // JWT is stateless; client discards tokens.
    // Optionally deactivate device token for push notifications.
    if (request.userId) {
      const supabase = getAdminClient();
      await supabase
        .from('user_device_tokens')
        .update({ is_active: false })
        .eq('user_id', request.userId);
    }

    return reply.send({ success: true });
  });
}

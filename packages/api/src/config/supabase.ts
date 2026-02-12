import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env.js';

let _adminClient: SupabaseClient | null = null;

/**
 * Admin Supabase client with service role key.
 * Bypasses RLS — use only in server-side trusted contexts.
 */
export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const env = getEnv();
    _adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _adminClient;
}

/**
 * Create a Supabase client scoped to a specific user's JWT.
 * Respects RLS policies based on the user's auth context.
 */
export function getUserClient(accessToken: string): SupabaseClient {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

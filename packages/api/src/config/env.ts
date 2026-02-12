import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // AI
  OPENAI_API_KEY: z.string().min(1),

  // Maps
  MAPBOX_ACCESS_TOKEN: z.string().optional(),

  // Push notifications
  FCM_PROJECT_ID: z.string().optional(),

  // Email
  SENDGRID_API_KEY: z.string().optional(),

  // Security
  ENCRYPTION_KEY: z.string().min(32),

  // Rate limiting
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const formatted = result.error.format();
      console.error('Invalid environment variables:', formatted);
      throw new Error('Invalid environment configuration');
    }
    _env = result.data;
  }
  return _env;
}

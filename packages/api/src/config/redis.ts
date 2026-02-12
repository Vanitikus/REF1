import Redis from 'ioredis';
import { getEnv } from './env.js';

interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string>;
  on(event: string, handler: (...args: unknown[]) => void): RedisClient;
  quit(): Promise<'OK'>;
}

let _redis: RedisClient | null = null;

export function getRedis(): RedisClient {
  if (!_redis) {
    const env = getEnv();
    _redis = new (Redis as unknown as new (url: string, opts: Record<string, unknown>) => RedisClient)(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 200, 3000);
        return delay;
      },
      lazyConnect: true,
    });

    _redis.on('error', (err: unknown) => {
      console.error('[Redis] Connection error:', (err as Error).message);
    });

    _redis.on('connect', () => {
      console.log('[Redis] Connected');
    });
  }
  return _redis;
}

export async function closeRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = null;
  }
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { getEnv } from './config/env.js';
import { getRedis, closeRedis } from './config/redis.js';
import { authRoutes } from './modules/auth/routes.js';
import { postRoutes } from './modules/posts/routes.js';
import { matchRoutes } from './modules/matches/routes.js';
import { chatRoutes } from './modules/chat/routes.js';
import { notificationRoutes } from './modules/notifications/routes.js';
import { reportRoutes } from './modules/reports/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { mapRoutes } from './modules/maps/routes.js';
import { authMiddleware } from './middleware/auth.js';

async function buildServer() {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
    trustProxy: true,
  });

  // ── Plugins ───────────────────────────────────────────────
  await app.register(cors, {
    origin: env.NODE_ENV === 'production'
      ? [env.APP_URL]
      : true,
    credentials: true,
  });

  if (env.RATE_LIMIT_ENABLED) {
    await app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      redis: getRedis(),
      keyGenerator: (request) => {
        return request.headers['x-user-id'] as string || request.ip;
      },
    });
  }

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  });

  // ── Auth middleware ────────────────────────────────────────
  app.decorateRequest('userId', null);
  app.decorateRequest('userRole', null);
  app.addHook('onRequest', authMiddleware);

  // ── Health check ──────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── Routes ────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(postRoutes, { prefix: '/posts' });
  await app.register(matchRoutes, { prefix: '/matches' });
  await app.register(chatRoutes, { prefix: '/conversations' });
  await app.register(notificationRoutes, { prefix: '/notifications' });
  await app.register(reportRoutes, { prefix: '/reports' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(mapRoutes, { prefix: '/map' });

  // ── Error handler ─────────────────────────────────────────
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const message = statusCode >= 500 ? 'Internal server error' : error.message;

    if (statusCode >= 500) {
      request.log.error(error);
    }

    reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code ?? 'INTERNAL_ERROR',
        message,
      },
    });
  });

  return app;
}

async function start() {
  const env = getEnv();
  const app = await buildServer();

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down...`);
      await app.close();
      await closeRedis();
      process.exit(0);
    });
  }

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`REFiND API running on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildServer };

#!/usr/bin/env node
import {
  createServer,
  createErrorHandler,
  startMetrics,
  registerShutdown,
  reportReadiness,
  startHeartbeats,
} from '@hive/service-common';
import * as Sentry from '@sentry/node';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { createScheduler } from './scheduler';
import { webhooksApiRouter } from './api';
import type { Context } from './types';
import { env } from './environment';

async function main() {
  if (env.sentry) {
    Sentry.init({
      serverName: 'webhooks',
      enabled: !!env.sentry,
      environment: env.environment,
      dsn: env.sentry.dsn,
      release: env.release,
    });
  }

  const server = await createServer({
    name: 'webhooks',
    tracing: false,
    log: {
      level: env.log.level,
    },
  });

  const errorHandler = createErrorHandler(server);

  try {
    const { schedule, readiness, start, stop } = createScheduler({
      logger: server.log,
      redis: {
        host: env.redis.host,
        port: env.redis.port,
        password: env.redis.password,
      },
      webhookQueueName: 'webhook',
      maxAttempts: 10,
      backoffDelay: 2000,
      requestBroker: env.requestBroker,
    });

    const stopHeartbeats = env.heartbeat
      ? startHeartbeats({
          enabled: true,
          endpoint: env.heartbeat.endpoint,
          intervalInMS: 20_000,
          onError: server.log.error,
          isReady: readiness,
        })
      : startHeartbeats({ enabled: false });

    registerShutdown({
      logger: server.log,
      async onShutdown() {
        stopHeartbeats();
        await stop();
      },
    });

    await server.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: webhooksApiRouter,
        createContext({ req }: CreateFastifyContextOptions): Context {
          return { logger: req.log, errorHandler, schedule };
        },
      },
    });

    server.route({
      method: ['GET', 'HEAD'],
      url: '/_health',
      handler(req, res) {
        void res.status(200).send();
      },
    });

    server.route({
      method: ['GET', 'HEAD'],
      url: '/_readiness',
      handler(_, res) {
        const isReady = readiness();
        reportReadiness(isReady);
        void res.status(isReady ? 200 : 400).send();
      },
    });

    await server.listen(env.http.port, '0.0.0.0');

    if (env.prometheus) {
      await startMetrics(env.prometheus.labels.instance);
    }

    await start();
  } catch (error) {
    server.log.fatal(error);
    Sentry.captureException(error, {
      level: 'fatal',
    });
    process.exit(1);
  }
}

main().catch(err => {
  Sentry.captureException(err, {
    level: 'fatal',
  });
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
import * as Sentry from '@sentry/node';
import {
  createServer,
  startMetrics,
  registerShutdown,
  reportReadiness,
  startHeartbeats,
} from '@hive/service-common';
import { createIngestor } from './ingestor';
import { env } from './environment';

async function main() {
  if (env.sentry) {
    Sentry.init({
      serverName: 'usage-ingestor',
      enabled: !!env.sentry,
      environment: env.environment,
      dsn: env.sentry.dsn,
      release: env.release,
    });
  }

  const server = await createServer({
    name: 'usage-ingestor',
    tracing: false,
    log: {
      level: env.log.level,
    },
  });

  try {
    const { readiness, start, stop } = createIngestor({
      logger: server.log,
      clickhouse: env.clickhouse,
      clickhouseMirror: env.clickhouseMirror,
      kafka: {
        topic: env.kafka.topic,
        consumerGroup: env.kafka.consumerGroup,
        concurrency: env.kafka.concurrency,
        connection: env.kafka.connection,
      },
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
        await Promise.all([stop(), server.close()]);
      },
    });

    server.route({
      method: ['GET', 'HEAD'],
      url: '/_health',
      handler(_, res) {
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

    if (env.prometheus) {
      await startMetrics(env.prometheus.labels.instance);
    }
    await server.listen(env.http.port, '0.0.0.0');
    await start();
  } catch (error) {
    server.log.fatal(error);
    Sentry.captureException(error, {
      level: 'fatal',
    });
  }
}

main().catch(err => {
  Sentry.captureException(err, {
    level: 'fatal',
  });
  console.error(err);
  process.exit(1);
});

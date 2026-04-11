import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CreateWebVitalInput } from '../validators/web-vitals.schemas';

type PrismaDbClient = PrismaClient | Prisma.TransactionClient;

export class WebVitalsRepository {
  create(input: CreateWebVitalInput, db: PrismaDbClient = prisma) {
    return db.webVitalMetric.create({
      data: {
        metric: input.metric,
        value: input.value,
        delta: input.delta,
        rating: input.rating,
        metricId: input.metricId,
        pageId: input.pageId,
        url: input.url,
        navigationType: input.navigationType,
        occurredAt: input.occurredAt,
        sessionId: input.sessionId,
        userAgent: input.userAgent,
        appVersion: input.appVersion,
      },
    });
  }

  listSince(occurredAtGte: Date, db: PrismaDbClient = prisma) {
    return db.webVitalMetric.findMany({
      where: {
        occurredAt: {
          gte: occurredAtGte,
        },
      },
      select: {
        metric: true,
        pageId: true,
        value: true,
        rating: true,
        occurredAt: true,
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });
  }
}

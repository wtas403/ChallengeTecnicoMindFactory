import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { connectTestDatabase, disconnectTestDatabase, seedDatabase } from '../helpers/test-db';

describe('Web Vitals API', () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('registra una metrica valida', async () => {
    const response = await request(app).post('/api/metrics/web-vitals').send({
      metric: 'LCP',
      value: 1900,
      delta: 100,
      rating: 'good',
      metricId: 'lcp-123',
      pageId: '/[dominio]/editar',
      url: '/AA123BB/editar',
      navigationType: 'navigate',
      timestamp: '2026-04-11T21:00:00.000Z',
      sessionId: 'session-1',
      userAgent: 'Mozilla/5.0',
      appVersion: '0.0.0',
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ status: 'accepted' });

    const metrics = await prisma.webVitalMetric.findMany({
      where: { metricId: 'lcp-123' },
    });
    expect(metrics).toHaveLength(1);
    expect(metrics[0]?.pageId).toBe('/[dominio]/editar');
  });

  it('responde 422 cuando el payload es invalido', async () => {
    const response = await request(app).post('/api/metrics/web-vitals').send({
      metric: 'FID',
      value: 1900,
      delta: 100,
      rating: 'good',
      metricId: 'fid-123',
      pageId: '/[dominio]/editar',
      url: '/AA123BB/editar',
      navigationType: 'navigate',
      timestamp: '2026-04-11T21:00:00.000Z',
      sessionId: 'session-1',
      userAgent: 'Mozilla/5.0',
      appVersion: '0.0.0',
    });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('devuelve summary por pagina y metrica', async () => {
    await request(app).post('/api/metrics/web-vitals').send({
      metric: 'LCP',
      value: 2000,
      delta: 100,
      rating: 'needs-improvement',
      metricId: 'lcp-1',
      pageId: '/',
      url: '/',
      navigationType: 'navigate',
      timestamp: '2026-04-11T21:00:00.000Z',
      sessionId: 'session-1',
      userAgent: 'Mozilla/5.0',
      appVersion: '0.0.0',
    });
    await request(app).post('/api/metrics/web-vitals').send({
      metric: 'LCP',
      value: 1500,
      delta: 70,
      rating: 'good',
      metricId: 'lcp-2',
      pageId: '/',
      url: '/',
      navigationType: 'navigate',
      timestamp: '2026-04-11T21:05:00.000Z',
      sessionId: 'session-1',
      userAgent: 'Mozilla/5.0',
      appVersion: '0.0.0',
    });

    const response = await request(app).get('/api/metrics/web-vitals/summary').query({ hours: 24 });

    expect(response.status).toBe(200);
    expect(response.body.hours).toBe(24);
    expect(response.body.totalEvents).toBe(2);
    expect(response.body.groups).toContainEqual(
      expect.objectContaining({
        metric: 'LCP',
        pageId: '/',
        samples: 2,
        p75: 2000,
        average: 1750,
        lastValue: 1500,
        lastRating: 'good',
      }),
    );
  });
});

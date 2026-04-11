import { describe, expect, it, vi } from 'vitest';
import { WebVitalsService } from '../../../src/services/web-vitals.service';
import { CreateWebVitalInput } from '../../../src/validators/web-vitals.schemas';

describe('WebVitalsService', () => {
  it('persiste el evento de web vital', async () => {
    const repository = {
      create: vi.fn().mockResolvedValue(undefined),
      listSince: vi.fn(),
    };
    const service = new WebVitalsService(repository as never);
    const input: CreateWebVitalInput = {
      metric: 'CLS',
      value: 0.02,
      delta: 0.01,
      rating: 'good',
      metricId: 'cls-1',
      pageId: '/',
      url: '/',
      navigationType: 'navigate',
      occurredAt: new Date('2026-04-11T21:00:00.000Z'),
      sessionId: 'session-1',
      userAgent: 'Mozilla/5.0',
      appVersion: '0.0.0',
    };

    await expect(service.track(input)).resolves.toBeUndefined();
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('arma summary agrupado por pagina y metrica', async () => {
    const repository = {
      create: vi.fn(),
      listSince: vi.fn().mockResolvedValue([
        {
          metric: 'LCP',
          pageId: '/',
          value: 1200,
          rating: 'good',
          occurredAt: new Date('2026-04-11T21:10:00.000Z'),
        },
        {
          metric: 'LCP',
          pageId: '/',
          value: 2000,
          rating: 'needs-improvement',
          occurredAt: new Date('2026-04-11T21:00:00.000Z'),
        },
        {
          metric: 'INP',
          pageId: '/crear',
          value: 90,
          rating: 'good',
          occurredAt: new Date('2026-04-11T21:05:00.000Z'),
        },
      ]),
    };
    const service = new WebVitalsService(repository as never);

    const result = await service.getSummary(24);

    expect(result.hours).toBe(24);
    expect(result.totalEvents).toBe(3);
    expect(result.groups).toContainEqual({
      metric: 'LCP',
      pageId: '/',
      samples: 2,
      p75: 2000,
      average: 1600,
      lastValue: 1200,
      lastRating: 'good',
      lastOccurredAt: '2026-04-11T21:10:00.000Z',
    });
    expect(result.groups).toContainEqual({
      metric: 'INP',
      pageId: '/crear',
      samples: 1,
      p75: 90,
      average: 90,
      lastValue: 90,
      lastRating: 'good',
      lastOccurredAt: '2026-04-11T21:05:00.000Z',
    });
  });
});

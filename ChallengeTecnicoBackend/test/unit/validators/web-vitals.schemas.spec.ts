import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../src/errors/validation-error';
import { parseCreateWebVitalInput, parseWebVitalSummaryQuery } from '../../../src/validators/web-vitals.schemas';

describe('web-vitals.schemas', () => {
  it('parsea y normaliza un evento valido', () => {
    const parsed = parseCreateWebVitalInput({
      metric: 'LCP',
      value: 2500.5,
      delta: 50.5,
      rating: 'needs-improvement',
      metricId: '  metric-123  ',
      pageId: ' /[dominio]/editar ',
      url: ' /AA123BB/editar ',
      navigationType: ' navigate ',
      timestamp: '2026-04-11T21:00:00.000Z',
      sessionId: '  sess-1 ',
      userAgent: '  Mozilla/5.0 ',
      appVersion: ' 0.0.0 ',
    });

    expect(parsed).toEqual({
      metric: 'LCP',
      value: 2500.5,
      delta: 50.5,
      rating: 'needs-improvement',
      metricId: 'metric-123',
      pageId: '/[dominio]/editar',
      url: '/AA123BB/editar',
      navigationType: 'navigate',
      occurredAt: new Date('2026-04-11T21:00:00.000Z'),
      sessionId: 'sess-1',
      userAgent: 'Mozilla/5.0',
      appVersion: '0.0.0',
    });
  });

  it('rechaza metric invalido', () => {
    expect(() =>
      parseCreateWebVitalInput({
        metric: 'FID',
        value: 1,
        delta: 1,
        rating: 'good',
        metricId: 'metric-1',
        pageId: '/',
        url: '/',
        navigationType: 'navigate',
        timestamp: '2026-04-11T21:00:00.000Z',
        sessionId: 'sess-1',
        userAgent: 'Mozilla/5.0',
        appVersion: '0.0.0',
      }),
    ).toThrowError(ValidationError);
  });

  it('rechaza timestamp invalido', () => {
    expect(() =>
      parseCreateWebVitalInput({
        metric: 'INP',
        value: 120,
        delta: 20,
        rating: 'good',
        metricId: 'metric-1',
        pageId: '/',
        url: '/',
        navigationType: 'navigate',
        timestamp: '11/04/2026',
        sessionId: 'sess-1',
        userAgent: 'Mozilla/5.0',
        appVersion: '0.0.0',
      }),
    ).toThrowError(ValidationError);
  });

  it('parsea query de summary con valor por defecto', () => {
    expect(parseWebVitalSummaryQuery({})).toEqual({ hours: 24 });
  });

  it('parsea query de summary con hours valido', () => {
    expect(parseWebVitalSummaryQuery({ hours: '72' })).toEqual({ hours: 72 });
  });

  it('rechaza query de summary con hours fuera de rango', () => {
    expect(() => parseWebVitalSummaryQuery({ hours: '0' })).toThrowError(ValidationError);
  });
});

import { z } from 'zod';
import { ValidationError } from '../errors/validation-error';
import { mapZodError } from './request.utils';

const webVitalMetricNames = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'] as const;
const webVitalRatings = ['good', 'needs-improvement', 'poor'] as const;

const createWebVitalInputSchema = z.object({
  metric: z.enum(webVitalMetricNames),
  value: z.number().finite(),
  delta: z.number().finite(),
  rating: z.enum(webVitalRatings),
  metricId: z.string().trim().min(1, 'El metricId es obligatorio.').max(128),
  pageId: z.string().trim().min(1, 'El pageId es obligatorio.').max(255),
  url: z.string().trim().min(1, 'La url es obligatoria.').max(2048),
  navigationType: z.string().trim().min(1, 'El navigationType es obligatorio.').max(64),
  timestamp: z.string().trim().datetime({ offset: true }),
  sessionId: z.string().trim().min(1, 'El sessionId es obligatorio.').max(64),
  userAgent: z.string().trim().min(1, 'El userAgent es obligatorio.').max(512),
  appVersion: z.string().trim().min(1, 'La appVersion es obligatoria.').max(32),
});

const webVitalSummaryQuerySchema = z.object({
  hours: z.coerce.number().int().min(1).max(168).default(24),
});

export interface CreateWebVitalInput {
  readonly metric: (typeof webVitalMetricNames)[number];
  readonly value: number;
  readonly delta: number;
  readonly rating: (typeof webVitalRatings)[number];
  readonly metricId: string;
  readonly pageId: string;
  readonly url: string;
  readonly navigationType: string;
  readonly occurredAt: Date;
  readonly sessionId: string;
  readonly userAgent: string;
  readonly appVersion: string;
}

export function parseCreateWebVitalInput(input: unknown): CreateWebVitalInput {
  const result = createWebVitalInputSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  return {
    metric: result.data.metric,
    value: result.data.value,
    delta: result.data.delta,
    rating: result.data.rating,
    metricId: result.data.metricId.trim(),
    pageId: result.data.pageId.trim(),
    url: result.data.url.trim(),
    navigationType: result.data.navigationType.trim(),
    occurredAt: new Date(result.data.timestamp),
    sessionId: result.data.sessionId.trim(),
    userAgent: result.data.userAgent.trim(),
    appVersion: result.data.appVersion.trim(),
  };
}

export function parseWebVitalSummaryQuery(input: unknown): { readonly hours: number } {
  const result = webVitalSummaryQuerySchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  return { hours: result.data.hours };
}

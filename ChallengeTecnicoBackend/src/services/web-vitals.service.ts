import { WebVitalsRepository } from '../repositories/web-vitals.repository';
import { CreateWebVitalInput } from '../validators/web-vitals.schemas';

type WebVitalMetricName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

interface WebVitalSummaryAccumulator {
  readonly metric: WebVitalMetricName;
  readonly pageId: string;
  readonly values: number[];
  samples: number;
  sum: number;
  lastValue: number;
  lastRating: WebVitalRating;
  lastOccurredAt: Date;
}

export interface WebVitalSummaryGroup {
  readonly metric: WebVitalMetricName;
  readonly pageId: string;
  readonly samples: number;
  readonly p75: number;
  readonly average: number;
  readonly lastValue: number;
  readonly lastRating: WebVitalRating;
  readonly lastOccurredAt: string;
}

export interface WebVitalSummary {
  readonly generatedAt: string;
  readonly from: string;
  readonly to: string;
  readonly hours: number;
  readonly totalEvents: number;
  readonly groups: readonly WebVitalSummaryGroup[];
}

export class WebVitalsService {
  constructor(private readonly webVitalsRepository = new WebVitalsRepository()) {}

  async track(input: CreateWebVitalInput): Promise<void> {
    await this.webVitalsRepository.create(input);
  }

  async getSummary(hours: number): Promise<WebVitalSummary> {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
    const events = await this.webVitalsRepository.listSince(from);
    const grouped = new Map<string, WebVitalSummaryAccumulator>();

    for (const event of events) {
      if (!this.isMetricName(event.metric) || !this.isRating(event.rating)) {
        continue;
      }

      const metric = event.metric;
      const rating = event.rating;
      const key = `${event.pageId}|${metric}`;
      const current = grouped.get(key);

      if (!current) {
        grouped.set(key, {
          metric,
          pageId: event.pageId,
          values: [event.value],
          samples: 1,
          sum: event.value,
          lastValue: event.value,
          lastRating: rating,
          lastOccurredAt: event.occurredAt,
        });
        continue;
      }

      current.values.push(event.value);
      current.samples += 1;
      current.sum += event.value;
    }

    const groups = [...grouped.values()]
      .map((group) => {
        const sortedValues = [...group.values].sort((left, right) => left - right);
        const p75 = this.percentile(sortedValues, 0.75);
        const average = group.sum / group.samples;

        return {
          metric: group.metric,
          pageId: group.pageId,
          samples: group.samples,
          p75,
          average,
          lastValue: group.lastValue,
          lastRating: group.lastRating,
          lastOccurredAt: group.lastOccurredAt.toISOString(),
        } satisfies WebVitalSummaryGroup;
      })
      .sort((left, right) => {
        if (left.pageId !== right.pageId) {
          return left.pageId.localeCompare(right.pageId);
        }

        return left.metric.localeCompare(right.metric);
      });

    return {
      generatedAt: to.toISOString(),
      from: from.toISOString(),
      to: to.toISOString(),
      hours,
      totalEvents: events.length,
      groups,
    };
  }

  private percentile(sortedValues: readonly number[], percentile: number): number {
    if (sortedValues.length === 0) {
      return 0;
    }

    const index = Math.max(0, Math.ceil(percentile * sortedValues.length) - 1);
    return sortedValues[index] ?? 0;
  }

  private isMetricName(metric: string): metric is WebVitalMetricName {
    return metric === 'CLS' || metric === 'FCP' || metric === 'INP' || metric === 'LCP' || metric === 'TTFB';
  }

  private isRating(rating: string): rating is WebVitalRating {
    return rating === 'good' || rating === 'needs-improvement' || rating === 'poor';
  }
}

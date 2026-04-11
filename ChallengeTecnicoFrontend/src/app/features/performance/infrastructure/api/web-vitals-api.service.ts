import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api.config';

export type WebVitalMetricName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalSummaryGroupDto {
  readonly metric: WebVitalMetricName;
  readonly pageId: string;
  readonly samples: number;
  readonly p75: number;
  readonly average: number;
  readonly lastValue: number;
  readonly lastRating: WebVitalRating;
  readonly lastOccurredAt: string;
}

export interface WebVitalSummaryDto {
  readonly generatedAt: string;
  readonly from: string;
  readonly to: string;
  readonly hours: number;
  readonly totalEvents: number;
  readonly groups: readonly WebVitalSummaryGroupDto[];
}

@Injectable({ providedIn: 'root' })
export class WebVitalsApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly webVitalsEndpoint = `${this.apiBaseUrl}/metrics/web-vitals`;

  getSummary(hours: number): Observable<WebVitalSummaryDto> {
    return this.httpClient.get<WebVitalSummaryDto>(`${this.webVitalsEndpoint}/summary`, {
      params: { hours: String(hours) },
    });
  }
}

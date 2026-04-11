import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

type WebVitalName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

interface WebVitalEvent {
  readonly metric: WebVitalName;
  readonly value: number;
  readonly delta: number;
  readonly rating: WebVitalRating;
  readonly metricId: string;
  readonly pageId: string;
  readonly url: string;
  readonly navigationType: string;
  readonly timestamp: string;
  readonly sessionId: string;
  readonly userAgent: string;
  readonly appVersion: string;
}

@Injectable({ providedIn: 'root' })
export class WebVitalsTelemetryService {
  private readonly router = inject(Router);
  private readonly endpoint = '/api/metrics/web-vitals';
  private readonly appVersion = '0.0.0';
  private readonly sessionId = this.createSessionId();
  private isInitialized = false;
  private pageId = '/';
  private currentUrl = '/';

  init(): void {
    if (this.isInitialized || !this.hasBrowserApis()) {
      return;
    }

    this.isInitialized = true;
    this.refreshRouteContext();
    this.watchRouteChanges();
    this.observeWebVitals();
  }

  private observeWebVitals(): void {
    onCLS((metric) => this.reportMetric(metric), { reportAllChanges: true });
    onINP((metric) => this.reportMetric(metric), { reportAllChanges: true });
    onLCP((metric) => this.reportMetric(metric), { reportAllChanges: true });
    onFCP((metric) => this.reportMetric(metric));
    onTTFB((metric) => this.reportMetric(metric));
  }

  private watchRouteChanges(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.refreshRouteContext();
      });
  }

  private refreshRouteContext(): void {
    this.currentUrl = this.router.url || '/';
    this.pageId = this.resolvePageId(this.router.routerState.snapshot.root);
  }

  private resolvePageId(snapshot: ActivatedRouteSnapshot): string {
    const segments: string[] = [];
    let current: ActivatedRouteSnapshot | null = snapshot;

    while (current) {
      const path = current.routeConfig?.path;
      if (path && path !== '**') {
        const parts = path
          .split('/')
          .filter((part) => part.length > 0)
          .map((part) => (part.startsWith(':') ? `[${part.slice(1)}]` : part));
        segments.push(...parts);
      }

      current = current.firstChild;
    }

    if (segments.length === 0) {
      return '/';
    }

    return `/${segments.join('/')}`;
  }

  private reportMetric(metric: Metric): void {
    if (!this.isWebVitalName(metric.name)) {
      return;
    }

    const event: WebVitalEvent = {
      metric: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      metricId: metric.id,
      pageId: this.pageId,
      url: this.currentUrl,
      navigationType: metric.navigationType,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      appVersion: this.appVersion,
    };

    this.send(event);
  }

  private send(event: WebVitalEvent): void {
    const body = JSON.stringify(event);

    if (typeof navigator.sendBeacon === 'function') {
      const payload = new Blob([body], { type: 'application/json' });
      const queued = navigator.sendBeacon(this.endpoint, payload);
      if (queued) {
        return;
      }
    }

    void fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {
      return;
    });
  }

  private hasBrowserApis(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof fetch === 'function'
    );
  }

  private createSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private isWebVitalName(name: string): name is WebVitalName {
    return name === 'CLS' || name === 'FCP' || name === 'INP' || name === 'LCP' || name === 'TTFB';
  }
}

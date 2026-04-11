import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  WebVitalSummaryDto,
  WebVitalSummaryGroupDto,
  WebVitalsApiService,
} from '../infrastructure/api/web-vitals-api.service';

@Component({
  selector: 'app-web-vitals-dashboard-page',
  imports: [RouterLink],
  template: `
    <main
      class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      aria-labelledby="web-vitals-dashboard-title"
    >
      <header class="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div class="grid gap-1">
          <p class="editorial-kicker m-0 text-[0.66rem] font-semibold text-slate-500">
            Observabilidad
          </p>
          <h1
            id="web-vitals-dashboard-title"
            class="editorial-title m-0 text-2xl font-semibold text-slate-950 sm:text-3xl"
          >
            Core Web Vitals
          </h1>
          <p class="m-0 text-sm text-slate-600">
            Resumen por pagina y metrica en tiempo real.
          </p>
        </div>

        <a routerLink="/" class="app-button app-button-secondary">Volver a automotores</a>
      </header>

      <section
        class="editorial-panel rounded-[1.5rem] p-4 sm:p-5"
        aria-live="polite"
        [attr.aria-busy]="isLoading()"
      >
        <div class="mb-4 grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          <label class="grid gap-1 text-sm font-medium text-slate-700" for="web-vitals-hours">
            Ventana
            <select
              id="web-vitals-hours"
              class="app-input app-select"
              [value]="selectedHours()"
              (change)="onHoursChange($event)"
            >
              <option value="1">Ultima hora</option>
              <option value="6">Ultimas 6 horas</option>
              <option value="24">Ultimas 24 horas</option>
              <option value="72">Ultimas 72 horas</option>
            </select>
          </label>

          @if (summary()) {
            <div class="grid gap-0.5 text-sm text-slate-600">
              <p class="m-0">Eventos: {{ summary()!.totalEvents }}</p>
              <p class="m-0">Grupos: {{ rows().length }}</p>
              <p class="m-0">Generado: {{ formatDate(summary()!.generatedAt) }}</p>
            </div>
          }

          <button type="button" class="app-button app-button-primary" (click)="reload()" [disabled]="isLoading()">
            {{ isLoading() ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>

        @if (errorMessage()) {
          <div
            class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            {{ errorMessage() }}
          </div>
        } @else if (isLoading() && !summary()) {
          <p class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700" role="status">
            Cargando metricas...
          </p>
        } @else if (rows().length === 0) {
          <p class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            Sin datos para el rango seleccionado.
          </p>
        } @else {
          <div class="grid gap-3 lg:hidden">
            @for (row of rows(); track row.pageId + '-' + row.metric) {
              <article class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {{ row.pageId }}
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-950">{{ row.metric }}</h2>
                <p class="m-0 text-sm text-slate-600">p75: {{ formatMetricValue(row.metric, row.p75) }}</p>
                <p class="m-0 text-sm text-slate-600">Promedio: {{ formatMetricValue(row.metric, row.average) }}</p>
                <p class="m-0 text-sm text-slate-600">Muestras: {{ row.samples }}</p>
                <p class="m-0 text-sm text-slate-600">
                  Ultima: {{ formatMetricValue(row.metric, row.lastValue) }} ·
                  <span [class]="ratingBadgeClass(row.lastRating)">{{ ratingLabel(row.lastRating) }}</span>
                </p>
              </article>
            }
          </div>

          <div class="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
            <table class="min-w-full divide-y divide-slate-200">
              <caption class="sr-only">Resumen de web vitals por pagina y metrica</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Page
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Metrica
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    p75
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Promedio
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Muestras
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Ultima
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Rating
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Ultimo evento
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (row of rows(); track row.pageId + '-' + row.metric) {
                  <tr class="text-sm text-slate-700">
                    <td class="px-4 py-3 font-medium text-slate-900">{{ row.pageId }}</td>
                    <td class="px-4 py-3">{{ row.metric }}</td>
                    <td class="px-4 py-3">{{ formatMetricValue(row.metric, row.p75) }}</td>
                    <td class="px-4 py-3">{{ formatMetricValue(row.metric, row.average) }}</td>
                    <td class="px-4 py-3">{{ row.samples }}</td>
                    <td class="px-4 py-3">{{ formatMetricValue(row.metric, row.lastValue) }}</td>
                    <td class="px-4 py-3">
                      <span [class]="ratingBadgeClass(row.lastRating)">{{ ratingLabel(row.lastRating) }}</span>
                    </td>
                    <td class="px-4 py-3">{{ formatDate(row.lastOccurredAt) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebVitalsDashboardPage implements OnInit {
  private readonly webVitalsApiService = inject(WebVitalsApiService);

  readonly selectedHours = signal(24);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly summary = signal<WebVitalSummaryDto | null>(null);
  readonly rows = computed<readonly WebVitalSummaryGroupDto[]>(() => this.summary()?.groups ?? []);

  ngOnInit(): void {
    void this.loadSummary();
  }

  reload(): void {
    void this.loadSummary();
  }

  onHoursChange(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    const hours = Number.parseInt(target.value, 10);
    if (!Number.isFinite(hours)) {
      return;
    }

    this.selectedHours.set(hours);
    void this.loadSummary();
  }

  ratingLabel(rating: 'good' | 'needs-improvement' | 'poor'): string {
    if (rating === 'good') {
      return 'Bueno';
    }

    if (rating === 'poor') {
      return 'Malo';
    }

    return 'Mejorable';
  }

  ratingBadgeClass(rating: 'good' | 'needs-improvement' | 'poor'): string {
    const baseClass = 'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold';

    if (rating === 'good') {
      return `${baseClass} bg-emerald-100 text-emerald-800`;
    }

    if (rating === 'poor') {
      return `${baseClass} bg-rose-100 text-rose-800`;
    }

    return `${baseClass} bg-amber-100 text-amber-800`;
  }

  formatMetricValue(metric: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB', value: number): string {
    if (metric === 'CLS') {
      return value.toFixed(3);
    }

    return `${Math.round(value)} ms`;
  }

  formatDate(dateIso: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateIso));
  }

  private async loadSummary(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const summary = await firstValueFrom(this.webVitalsApiService.getSummary(this.selectedHours()));
      this.summary.set(summary);
    } catch {
      this.errorMessage.set('No se pudo cargar el dashboard de metricas.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

import { Injectable, computed, signal } from '@angular/core';
import { ApiError } from '../../../../core/http/api-error';
import { Automotor } from '../../domain/models/automotor';
import { AutomotoresFilters } from '../../domain/types/automotores-filters';
import { AutomotoresPage } from '../../domain/types/automotores-page';
import { AutomotoresSort, AutomotoresSortField } from '../../domain/types/automotores-sort';
import {
  calculateTotalPages,
  filterAutomotores,
  paginateAutomotores,
  sortAutomotores,
} from '../use-cases/query-automotores';

export type AutomotoresLoadStatus = 'idle' | 'loading' | 'success' | 'error';

const INITIAL_FILTERS: AutomotoresFilters = {
  searchTerm: '',
};

const INITIAL_SORT: AutomotoresSort = {
  field: 'dominio',
  direction: 'asc',
};

const INITIAL_PAGE: AutomotoresPage = {
  page: 1,
  pageSize: 10,
};

@Injectable({ providedIn: 'root' })
export class AutomotoresStore {
  private readonly automotoresState = signal<readonly Automotor[]>([]);
  private readonly loadStatusState = signal<AutomotoresLoadStatus>('idle');
  private readonly errorState = signal<ApiError | null>(null);
  private readonly isRefreshingState = signal(false);
  private readonly filtersState = signal<AutomotoresFilters>(INITIAL_FILTERS);
  private readonly sortState = signal<AutomotoresSort>(INITIAL_SORT);
  private readonly pageState = signal<AutomotoresPage>(INITIAL_PAGE);

  readonly loadStatus = computed(() => this.loadStatusState());
  readonly error = computed(() => this.errorState());
  readonly filters = computed(() => this.filtersState());
  readonly sort = computed(() => this.sortState());
  readonly page = computed(() => this.pageState());
  readonly isLoading = computed(() => this.loadStatusState() === 'loading');
  readonly isRefreshing = computed(() => this.isRefreshingState());
  readonly hasError = computed(
    () => this.loadStatusState() === 'error' && this.errorState() !== null,
  );

  readonly filteredAutomotores = computed(() =>
    filterAutomotores(this.automotoresState(), this.filtersState()),
  );
  readonly sortedAutomotores = computed(() =>
    sortAutomotores(this.filteredAutomotores(), this.sortState()),
  );
  readonly totalItems = computed(() => this.sortedAutomotores().length);
  readonly totalPages = computed(() =>
    calculateTotalPages(this.totalItems(), this.pageState().pageSize),
  );
  readonly currentPage = computed(() => {
    const page = Math.max(1, this.pageState().page);
    return Math.min(page, this.totalPages());
  });
  readonly automotores = computed(() =>
    paginateAutomotores(this.sortedAutomotores(), {
      page: this.currentPage(),
      pageSize: this.pageState().pageSize,
    }),
  );
  readonly isEmpty = computed(
    () => this.loadStatusState() === 'success' && this.totalItems() === 0,
  );

  setLoading(): void {
    this.loadStatusState.set('loading');
    this.isRefreshingState.set(false);
    this.errorState.set(null);
  }

  setRefreshing(): void {
    this.isRefreshingState.set(true);
    this.errorState.set(null);
  }

  setSuccess(automotores: readonly Automotor[]): void {
    this.automotoresState.set(automotores);
    this.loadStatusState.set('success');
    this.isRefreshingState.set(false);
    this.errorState.set(null);
    this.ensurePageIsInRange();
  }

  setError(error: ApiError): void {
    this.loadStatusState.set('error');
    this.isRefreshingState.set(false);
    this.errorState.set(error);
  }

  finishRefresh(): void {
    this.isRefreshingState.set(false);
  }

  setSearchTerm(searchTerm: string): void {
    this.filtersState.update((current) => ({ ...current, searchTerm }));
    this.pageState.update((current) => ({ ...current, page: 1 }));
    this.ensurePageIsInRange();
  }

  toggleSort(field: AutomotoresSortField): void {
    this.sortState.update((current) => {
      if (current.field === field) {
        return {
          field,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        field,
        direction: 'asc',
      };
    });
    this.ensurePageIsInRange();
  }

  setPage(page: number): void {
    this.pageState.update((current) => ({
      ...current,
      page: Math.max(1, Math.floor(page)),
    }));
    this.ensurePageIsInRange();
  }

  setPageSize(pageSize: number): void {
    this.pageState.update((current) => ({
      ...current,
      pageSize: Math.max(1, Math.floor(pageSize)),
      page: 1,
    }));
    this.ensurePageIsInRange();
  }

  removeByDominio(dominio: string): void {
    this.automotoresState.update((current) =>
      current.filter((automotor) => automotor.dominio !== dominio),
    );
    this.loadStatusState.set('success');
    this.isRefreshingState.set(false);
    this.errorState.set(null);
    this.ensurePageIsInRange();
  }

  private ensurePageIsInRange(): void {
    const maxPage = this.totalPages();
    const currentPage = Math.max(1, this.pageState().page);

    if (currentPage > maxPage) {
      this.pageState.update((current) => ({
        ...current,
        page: maxPage,
      }));
    }
  }
}

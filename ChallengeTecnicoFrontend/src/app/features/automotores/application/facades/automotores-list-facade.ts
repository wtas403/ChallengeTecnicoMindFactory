import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiError, isApiError } from '../../../../core/http/api-error';
import {
  AUTOMOTORES_REPOSITORY,
  AutomotoresRepository,
} from '../../infrastructure/repositories/automotores-repository';
import { AutomotoresStore } from '../stores/automotores-store';
import { AutomotoresSortField } from '../../domain/types/automotores-sort';

@Injectable({ providedIn: 'root' })
export class AutomotoresListFacade {
  private readonly automotoresStore = inject(AutomotoresStore);
  private readonly automotoresRepository = inject<AutomotoresRepository>(AUTOMOTORES_REPOSITORY);
  private readonly deletingDominiosState = signal<readonly string[]>([]);

  readonly automotores = computed(() => this.automotoresStore.automotores());
  readonly loadStatus = computed(() => this.automotoresStore.loadStatus());
  readonly isLoading = computed(() => this.automotoresStore.isLoading());
  readonly isRefreshing = computed(() => this.automotoresStore.isRefreshing());
  readonly hasError = computed(() => this.automotoresStore.hasError());
  readonly error = computed(() => this.automotoresStore.error());
  readonly isEmpty = computed(() => this.automotoresStore.isEmpty());
  readonly filters = computed(() => this.automotoresStore.filters());
  readonly sort = computed(() => this.automotoresStore.sort());
  readonly page = computed(() => this.automotoresStore.page());
  readonly currentPage = computed(() => this.automotoresStore.currentPage());
  readonly totalItems = computed(() => this.automotoresStore.totalItems());
  readonly totalPages = computed(() => this.automotoresStore.totalPages());
  readonly deletingDominios = computed(() => this.deletingDominiosState());

  async load(): Promise<void> {
    if (this.automotoresStore.isLoading() || this.automotoresStore.isRefreshing()) {
      return;
    }

    this.automotoresStore.setLoading();

    try {
      const automotores = await this.automotoresRepository.list();
      this.automotoresStore.setSuccess(automotores);
    } catch (error) {
      this.automotoresStore.setError(this.ensureApiError(error));
    }
  }

  async reload(): Promise<void> {
    if (this.automotoresStore.isLoading() || this.automotoresStore.isRefreshing()) {
      return;
    }

    const hasLoadedData =
      this.automotoresStore.loadStatus() === 'success' || this.automotoresStore.totalItems() > 0;

    if (hasLoadedData) {
      this.automotoresStore.setRefreshing();
    } else {
      this.automotoresStore.setLoading();
    }

    try {
      const automotores = await this.automotoresRepository.list();
      this.automotoresStore.setSuccess(automotores);
    } catch (error) {
      const apiError = this.ensureApiError(error);

      if (hasLoadedData) {
        this.automotoresStore.finishRefresh();
        throw apiError;
      }

      this.automotoresStore.setError(apiError);
      throw apiError;
    }
  }

  setSearchTerm(searchTerm: string): void {
    this.automotoresStore.setSearchTerm(searchTerm);
  }

  toggleSort(field: AutomotoresSortField): void {
    this.automotoresStore.toggleSort(field);
  }

  setPage(page: number): void {
    this.automotoresStore.setPage(page);
  }

  nextPage(): void {
    this.automotoresStore.setPage(this.automotoresStore.currentPage() + 1);
  }

  previousPage(): void {
    this.automotoresStore.setPage(this.automotoresStore.currentPage() - 1);
  }

  setPageSize(pageSize: number): void {
    this.automotoresStore.setPageSize(pageSize);
  }

  isDeletingDominio(dominio: string): boolean {
    return this.deletingDominiosState().includes(dominio);
  }

  async deleteByDominio(dominio: string): Promise<void> {
    if (this.isDeletingDominio(dominio)) {
      return;
    }

    this.deletingDominiosState.update((current) => [...current, dominio]);

    try {
      await this.automotoresRepository.delete(dominio);
      this.automotoresStore.removeByDominio(dominio);
    } catch (error) {
      throw this.ensureApiError(error);
    } finally {
      this.deletingDominiosState.update((current) => current.filter((item) => item !== dominio));
    }
  }

  private ensureApiError(error: unknown): ApiError {
    if (isApiError(error)) {
      return error;
    }

    return new ApiError(0, 'No se pudieron cargar los automotores. Intenta nuevamente.');
  }
}

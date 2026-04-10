import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AutomotoresListFacade } from '../application/facades/automotores-list-facade';
import { AutomotoresSortField } from '../domain/types/automotores-sort';

@Component({
  selector: 'app-automotores-list',
  imports: [LucideAngularModule],
  template: `
    <section
      id="automotores-list-section"
      class="editorial-panel rounded-[1.5rem] p-4 motion-safe:animate-[fade-up_0.5s_ease-out] sm:p-5"
      aria-live="polite"
      [attr.aria-busy]="isLoading()"
    >
      <header
        class="mb-5 grid gap-4 border-b border-slate-200 pb-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
      >
        <div class="grid gap-2">
          <p class="editorial-kicker text-[0.68rem] font-semibold text-slate-500">
            Consulta operativa
          </p>
          <div class="grid gap-1">
            <label
              class="text-sm font-semibold tracking-wide text-slate-800"
              for="automotores-search"
            >
              Buscar por dominio o CUIT
            </label>
            <p class="m-0 max-w-2xl text-sm text-slate-600">
              Busca por dominio o CUIT y administra los registros disponibles.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 lg:items-end">
          <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div class="relative min-w-0 sm:min-w-84">
              <input
                id="automotores-search"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-500 focus-visible:border-sky-700"
                type="search"
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
                placeholder="Ej: AA123BB o 20123456786"
                aria-describedby="automotores-search-hint"
              />
            </div>
            <button
              id="automotores-reload"
              type="button"
              class="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              (click)="reload()"
              [disabled]="isLoading()"
              aria-label="Actualizar listado"
            >
              <lucide-angular name="search" class="size-4"></lucide-angular>
            </button>
          </div>
          <p id="automotores-search-hint" class="text-xs text-slate-500 lg:text-right">
            Busca coincidencias sobre dominio o CUIT del titular.
          </p>
        </div>
      </header>

      @if (isLoading()) {
        <p
          id="automotores-state-loading"
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
          role="status"
        >
          Cargando automotores...
        </p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          @for (item of skeletonItems; track item) {
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="mb-4 h-4 w-24 animate-pulse rounded bg-slate-200"></div>
              <div class="grid gap-3">
                <div class="h-8 animate-pulse rounded bg-slate-200/90"></div>
                <div class="h-8 animate-pulse rounded bg-slate-200/70"></div>
                <div class="h-8 animate-pulse rounded bg-slate-200/60"></div>
              </div>
            </div>
          }
        </div>
      } @else if (hasError()) {
        <div
          id="automotores-state-error"
          class="grid gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900"
          role="alert"
        >
          <p class="font-medium">{{ errorMessage() }}</p>
          <button
            id="automotores-retry"
            type="button"
            class="inline-flex w-fit items-center justify-center rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            (click)="reload()"
          >
            Reintentar
          </button>
        </div>
      } @else if (isEmpty()) {
        <div
          id="automotores-state-empty"
          class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600"
          role="status"
        >
          <p class="editorial-title text-xl font-semibold text-slate-900">No hay resultados</p>
          <p class="mx-auto mt-2 max-w-md">
            Ajusta el termino de busqueda o recarga el listado para volver a consultar la flota
            disponible.
          </p>
        </div>
      } @else {
        <div id="automotores-state-success" class="grid gap-4">
          <div class="grid gap-3 lg:hidden">
            @for (automotor of automotores(); track automotor.dominio) {
              <article class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <p class="editorial-kicker m-0 text-[0.65rem] font-semibold text-slate-500">
                      Dominio
                    </p>
                    <p class="m-0 text-base font-semibold tracking-[0.04em] text-slate-950">
                      {{ automotor.dominio }}
                    </p>
                  </div>
                  <p
                    class="m-0 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {{ automotor.fechaFabricacion }}
                  </p>
                </div>

                <dl class="mt-4 grid gap-3 text-sm">
                  <div class="grid gap-1">
                    <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Dueno
                    </dt>
                    <dd class="m-0 font-medium text-slate-900">
                      {{ automotor.titular.nombreCompleto }}
                    </dd>
                  </div>
                  <div class="grid gap-1">
                    <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      CUIT
                    </dt>
                    <dd class="m-0 text-slate-700">{{ automotor.titular.cuit }}</dd>
                  </div>
                </dl>

                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    [id]="mobileEditButtonId(automotor.dominio)"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    aria-label="Editar {{ automotor.dominio }}"
                    (click)="onEdit(automotor.dominio)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    [id]="mobileDeleteButtonId(automotor.dominio)"
                    class="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Eliminar {{ automotor.dominio }}"
                    [disabled]="isDeleting(automotor.dominio)"
                    (click)="onDelete(automotor.dominio)"
                  >
                    {{ isDeleting(automotor.dominio) ? 'Eliminando...' : 'Eliminar' }}
                  </button>
                </div>
              </article>
            }
          </div>

          <div class="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
            <table
              id="automotores-table"
              class="min-w-full divide-y divide-slate-200 bg-transparent"
            >
              <caption class="sr-only">
                Listado de automotores
              </caption>
              <thead>
                <tr class="bg-slate-50">
                  <th scope="col" [attr.aria-sort]="ariaSortFor('dominio')">
                    <button
                      type="button"
                      class="flex w-full items-center gap-1.5 px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      (click)="toggleSort('dominio')"
                    >
                      <span>Dominio</span>
                      <span class="inline-flex w-4 shrink-0 justify-center" aria-hidden="true">
                        @switch (sortIconName('dominio')) {
                          @case ('arrow-up') {
                            <lucide-angular name="arrow-up" class="size-3.5"></lucide-angular>
                          }
                          @case ('arrow-down') {
                            <lucide-angular name="arrow-down" class="size-3.5"></lucide-angular>
                          }
                          @default {
                            <lucide-angular
                              name="arrow-up-down"
                              class="size-3.5 text-slate-400"
                            ></lucide-angular>
                          }
                        }
                      </span>
                    </button>
                  </th>
                  <th scope="col" [attr.aria-sort]="ariaSortFor('titular')">
                    <button
                      type="button"
                      class="flex w-full items-center gap-1.5 px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      (click)="toggleSort('titular')"
                    >
                      <span>Dueno</span>
                      <span class="inline-flex w-4 shrink-0 justify-center" aria-hidden="true">
                        @switch (sortIconName('titular')) {
                          @case ('arrow-up') {
                            <lucide-angular name="arrow-up" class="size-3.5"></lucide-angular>
                          }
                          @case ('arrow-down') {
                            <lucide-angular name="arrow-down" class="size-3.5"></lucide-angular>
                          }
                          @default {
                            <lucide-angular
                              name="arrow-up-down"
                              class="size-3.5 text-slate-400"
                            ></lucide-angular>
                          }
                        }
                      </span>
                    </button>
                  </th>
                  <th scope="col" [attr.aria-sort]="ariaSortFor('cuit')">
                    <button
                      type="button"
                      class="flex w-full items-center gap-1.5 px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      (click)="toggleSort('cuit')"
                    >
                      <span>CUIT</span>
                      <span class="inline-flex w-4 shrink-0 justify-center" aria-hidden="true">
                        @switch (sortIconName('cuit')) {
                          @case ('arrow-up') {
                            <lucide-angular name="arrow-up" class="size-3.5"></lucide-angular>
                          }
                          @case ('arrow-down') {
                            <lucide-angular name="arrow-down" class="size-3.5"></lucide-angular>
                          }
                          @default {
                            <lucide-angular
                              name="arrow-up-down"
                              class="size-3.5 text-slate-400"
                            ></lucide-angular>
                          }
                        }
                      </span>
                    </button>
                  </th>
                  <th scope="col" [attr.aria-sort]="ariaSortFor('fechaFabricacion')">
                    <button
                      type="button"
                      class="flex w-full items-center gap-1.5 px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      (click)="toggleSort('fechaFabricacion')"
                    >
                      <span>Fabricacion</span>
                      <span class="inline-flex w-4 shrink-0 justify-center" aria-hidden="true">
                        @switch (sortIconName('fechaFabricacion')) {
                          @case ('arrow-up') {
                            <lucide-angular name="arrow-up" class="size-3.5"></lucide-angular>
                          }
                          @case ('arrow-down') {
                            <lucide-angular name="arrow-down" class="size-3.5"></lucide-angular>
                          }
                          @default {
                            <lucide-angular
                              name="arrow-up-down"
                              class="size-3.5 text-slate-400"
                            ></lucide-angular>
                          }
                        }
                      </span>
                    </button>
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-700"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (automotor of automotores(); track automotor.dominio) {
                  <tr
                    class="border-t border-slate-200 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <td class="px-4 py-3 font-semibold tracking-[0.04em] text-slate-950">
                      {{ automotor.dominio }}
                    </td>
                    <td class="px-4 py-3">{{ automotor.titular.nombreCompleto }}</td>
                    <td class="px-4 py-3">{{ automotor.titular.cuit }}</td>
                    <td class="px-4 py-3">{{ automotor.fechaFabricacion }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-3">
                        <button
                          type="button"
                          [id]="editButtonId(automotor.dominio)"
                          class="text-sm font-semibold text-sky-900 underline-offset-2 transition hover:text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                          aria-label="Editar {{ automotor.dominio }}"
                          (click)="onEdit(automotor.dominio)"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          [id]="deleteButtonId(automotor.dominio)"
                          class="text-sm font-semibold text-rose-800 underline-offset-2 transition hover:text-rose-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Eliminar {{ automotor.dominio }}"
                          [disabled]="isDeleting(automotor.dominio)"
                          (click)="onDelete(automotor.dominio)"
                        >
                          {{ isDeleting(automotor.dominio) ? 'Eliminando...' : 'Eliminar' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <footer
            id="automotores-pagination"
            class="mt-2 grid gap-4 border-t border-slate-200 pt-4 text-sm text-slate-700 motion-safe:animate-[fade-in_0.35s_ease-out] xl:grid-cols-[auto_1fr_auto] xl:items-center"
            aria-label="Paginacion de automotores"
          >
            <div class="grid gap-1">
              <p class="m-0 font-semibold text-slate-900">{{ visibleRangeSummary() }}</p>
              <p id="automotores-page-indicator" class="m-0 text-slate-600">
                Pagina {{ currentPage() }} de {{ totalPages() }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 xl:justify-center">
              <button
                id="automotores-page-previous"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                (click)="previousPage()"
                [disabled]="currentPage() <= 1"
              >
                Anterior
              </button>

              @for (pageNumber of visiblePageNumbers(); track pageNumber) {
                <button
                  type="button"
                  [class]="paginationButtonClass(pageNumber)"
                  (click)="goToPage(pageNumber)"
                  [attr.aria-current]="pageNumber === currentPage() ? 'page' : null"
                  [attr.aria-label]="pageAriaLabel(pageNumber)"
                >
                  {{ pageNumber }}
                </button>
              }

              <button
                id="automotores-page-next"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                (click)="nextPage()"
                [disabled]="currentPage() >= totalPages()"
              >
                Siguiente
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2 xl:justify-end">
              <label
                for="automotores-page-size"
                class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                >Por pagina</label
              >
              <select
                id="automotores-page-size"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition focus-visible:border-sky-700 focus-visible:outline-none"
                [value]="pageSize()"
                (change)="onPageSizeChange($event)"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          </footer>
        </div>
      }

      @if (pendingDeleteDominio()) {
        <div
          id="automotor-delete-confirmation-backdrop"
          class="fixed inset-0 z-40 bg-slate-950/35"
          (click)="cancelDelete()"
        ></div>

        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          (keydown.escape)="cancelDelete()"
        >
          <section
            id="automotor-delete-confirmation-dialog"
            class="editorial-panel w-full max-w-lg rounded-xl p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="automotor-delete-title"
            aria-describedby="automotor-delete-description"
          >
            <div class="mb-4 flex items-start gap-3 border-b border-slate-200 pb-3">
              <div
                class="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700"
              >
                <lucide-angular name="triangle-alert" class="size-5"></lucide-angular>
              </div>
              <div>
                <p class="editorial-kicker m-0 text-[0.68rem] font-semibold text-slate-500">
                  Confirmacion
                </p>
                <h3
                  id="automotor-delete-title"
                  class="editorial-title mt-1 text-lg font-semibold text-slate-950"
                >
                  Confirmar eliminacion
                </h3>
              </div>
            </div>

            <p id="automotor-delete-description" class="m-0 text-sm text-slate-600">
              Se eliminara el automotor
              <span class="font-semibold text-slate-900">{{ pendingDeleteDominio() }}</span
              >. Esta accion no se puede deshacer.
            </p>

            <div class="mt-5 flex flex-wrap gap-2.5 border-t border-slate-200 pt-4">
              <button
                id="automotor-delete-confirm"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-rose-600 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                (click)="confirmDelete()"
              >
                Confirmar eliminacion
              </button>
              <button
                id="automotor-delete-cancel"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                (click)="cancelDelete()"
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotoresList implements OnInit {
  private readonly facade = inject(AutomotoresListFacade);
  private readonly router = inject(Router);

  readonly automotores = computed(() => this.facade.automotores());
  readonly isLoading = computed(() => this.facade.isLoading());
  readonly hasError = computed(() => this.facade.hasError());
  readonly isEmpty = computed(() => this.facade.isEmpty());
  readonly totalItems = computed(() => this.facade.totalItems());
  readonly totalPages = computed(() => this.facade.totalPages());
  readonly currentPage = computed(() => this.facade.currentPage());
  readonly pageSize = computed(() => this.facade.page().pageSize);
  readonly searchTerm = computed(() => this.facade.filters().searchTerm);
  readonly errorMessage = computed(
    () => this.facade.error()?.message ?? 'No se pudieron cargar los automotores.',
  );
  readonly skeletonItems = [1, 2, 3];
  readonly pendingDeleteDominio = signal<string | null>(null);

  ngOnInit(): void {
    void this.facade.load();
  }

  reload(): void {
    void this.facade.reload();
  }

  onSearchInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.facade.setSearchTerm(target.value);
  }

  toggleSort(field: AutomotoresSortField): void {
    this.facade.toggleSort(field);
  }

  previousPage(): void {
    this.facade.previousPage();
  }

  nextPage(): void {
    this.facade.nextPage();
  }

  goToPage(page: number): void {
    this.facade.setPage(page);
  }

  onEdit(dominio: string): void {
    void this.router.navigate([`/${dominio}/editar`]);
  }

  onDelete(dominio: string): void {
    this.pendingDeleteDominio.set(dominio);
  }

  cancelDelete(): void {
    this.pendingDeleteDominio.set(null);
  }

  confirmDelete(): void {
    const dominio = this.pendingDeleteDominio();

    if (!dominio) {
      return;
    }

    this.pendingDeleteDominio.set(null);
    void this.facade.deleteByDominio(dominio);
  }

  isDeleting(dominio: string): boolean {
    return this.facade.isDeletingDominio(dominio);
  }

  onPageSizeChange(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.facade.setPageSize(Number.parseInt(target.value, 10));
  }

  ariaSortFor(field: AutomotoresSortField): 'ascending' | 'descending' | 'none' {
    const currentSort = this.facade.sort();

    if (currentSort.field !== field) {
      return 'none';
    }

    return currentSort.direction === 'asc' ? 'ascending' : 'descending';
  }

  sortIconName(field: AutomotoresSortField): 'arrow-up' | 'arrow-down' | 'arrow-up-down' {
    const currentSort = this.facade.sort();

    if (currentSort.field !== field) {
      return 'arrow-up-down';
    }

    return currentSort.direction === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  visibleRangeSummary(): string {
    const totalItems = this.totalItems();

    if (totalItems === 0) {
      return 'Sin resultados para mostrar';
    }

    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), totalItems);
    return `Mostrando ${start}-${end} de ${totalItems} automotores`;
  }

  resultsSummary(): string {
    if (this.searchTerm().trim().length > 0) {
      return `${this.totalItems()} resultado${this.totalItems() === 1 ? '' : 's'} para "${this.searchTerm().trim()}"`;
    }

    return `${this.totalItems()} automotores disponibles`;
  }

  pageSummary(): string {
    return `Vista actual ordenada por ${this.sortLabel().toLocaleLowerCase()}.`;
  }

  sortLabel(): string {
    const sort = this.facade.sort();
    const fieldLabel =
      sort.field === 'dominio'
        ? 'Dominio'
        : sort.field === 'titular'
          ? 'Dueno'
          : sort.field === 'cuit'
            ? 'CUIT'
            : 'Fabricacion';

    return `${fieldLabel} ${sort.direction === 'asc' ? 'ascendente' : 'descendente'}`;
  }

  visiblePageNumbers(): readonly number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    const pages: number[] = [];

    for (let page = normalizedStart; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }

  pageAriaLabel(pageNumber: number): string {
    return pageNumber === this.currentPage()
      ? `Pagina actual, ${pageNumber}`
      : `Ir a la pagina ${pageNumber}`;
  }

  paginationButtonClass(pageNumber: number): string {
    const baseClass =
      'inline-flex min-w-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300';

    return pageNumber === this.currentPage()
      ? `${baseClass} border-slate-900 bg-slate-900 text-white`
      : `${baseClass} border-slate-300 bg-white text-slate-700`;
  }

  editButtonId(dominio: string): string {
    return `automotor-${dominio}-edit`;
  }

  deleteButtonId(dominio: string): string {
    return `automotor-${dominio}-delete`;
  }

  mobileEditButtonId(dominio: string): string {
    return `automotor-${dominio}-edit-mobile`;
  }

  mobileDeleteButtonId(dominio: string): string {
    return `automotor-${dominio}-delete-mobile`;
  }
}

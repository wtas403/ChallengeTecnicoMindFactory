import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AutomotoresListFacade } from '../application/facades/automotores-list-facade';
import { AutomotoresSortField } from '../domain/types/automotores-sort';

@Component({
  selector: 'app-automotores-list',
  template: `
    <section
      id="automotores-list-section"
      class="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur motion-safe:animate-[fade-up_0.5s_ease-out] sm:p-6"
      aria-live="polite"
      [attr.aria-busy]="isLoading()"
    >
      <header class="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label class="text-sm font-semibold tracking-wide text-slate-700" for="automotores-search">
          Buscar por dominio o CUIT
        </label>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="automotores-search"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:min-w-80"
            type="search"
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            placeholder="Ej: AA123BB o 20123456786"
            aria-describedby="automotores-search-hint"
          />
          <p id="automotores-search-hint" class="sr-only">
            Puedes buscar por dominio o por CUIT del titular.
          </p>
          <button
            id="automotores-reload"
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            (click)="reload()"
            [disabled]="isLoading()"
          >
            Recargar
          </button>
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
      } @else if (hasError()) {
        <div
          id="automotores-state-error"
          class="grid gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
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
          class="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-600"
          role="status"
        >
          <p>No hay automotores para los filtros seleccionados.</p>
        </div>
      } @else {
        <div
          id="automotores-state-success"
          class="overflow-x-auto rounded-xl border border-slate-200"
        >
          <table id="automotores-table" class="min-w-full divide-y divide-slate-200 bg-white">
            <caption class="sr-only">
              Listado de automotores
            </caption>
            <thead>
              <tr class="bg-slate-100/90">
                <th scope="col" [attr.aria-sort]="ariaSortFor('dominio')">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    (click)="toggleSort('dominio')"
                  >
                    Dominio {{ sortIndicator('dominio') }}
                  </button>
                </th>
                <th scope="col" [attr.aria-sort]="ariaSortFor('titular')">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    (click)="toggleSort('titular')"
                  >
                    Dueno {{ sortIndicator('titular') }}
                  </button>
                </th>
                <th scope="col" [attr.aria-sort]="ariaSortFor('cuit')">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    (click)="toggleSort('cuit')"
                  >
                    CUIT {{ sortIndicator('cuit') }}
                  </button>
                </th>
                <th scope="col" [attr.aria-sort]="ariaSortFor('fechaFabricacion')">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    (click)="toggleSort('fechaFabricacion')"
                  >
                    Fabricacion {{ sortIndicator('fechaFabricacion') }}
                  </button>
                </th>
                <th
                  scope="col"
                  class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              @for (automotor of automotores(); track automotor.dominio) {
                <tr
                  class="border-t border-slate-200 text-sm text-slate-700 transition hover:bg-cyan-50/60"
                >
                  <td class="px-3 py-3 font-semibold text-slate-900">{{ automotor.dominio }}</td>
                  <td class="px-3 py-3">{{ automotor.titular.nombreCompleto }}</td>
                  <td class="px-3 py-3">{{ automotor.titular.cuit }}</td>
                  <td class="px-3 py-3">{{ automotor.fechaFabricacion }}</td>
                  <td class="px-3 py-3">
                    <div class="flex flex-wrap gap-3">
                      <button
                        type="button"
                        [id]="editButtonId(automotor.dominio)"
                        class="text-sm font-semibold text-cyan-700 underline-offset-2 transition hover:text-cyan-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                        aria-label="Editar {{ automotor.dominio }}"
                        (click)="onEdit(automotor.dominio)"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        [id]="deleteButtonId(automotor.dominio)"
                        class="text-sm font-semibold text-rose-700 underline-offset-2 transition hover:text-rose-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
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
          class="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 motion-safe:animate-[fade-in_0.35s_ease-out] lg:flex-row lg:items-center lg:justify-between"
          aria-label="Paginacion de automotores"
        >
          <p class="font-medium">
            Mostrando {{ automotores().length }} de {{ totalItems() }} automotores
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <label for="automotores-page-size" class="sr-only">Elementos por pagina</label>
            <select
              id="automotores-page-size"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [value]="pageSize()"
              (change)="onPageSizeChange($event)"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>

            <button
              id="automotores-page-previous"
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              (click)="previousPage()"
              [disabled]="currentPage() <= 1"
            >
              Anterior
            </button>

            <span id="automotores-page-indicator" class="px-1 font-semibold text-slate-700"
              >Pagina {{ currentPage() }} de {{ totalPages() }}</span
            >

            <button
              id="automotores-page-next"
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              (click)="nextPage()"
              [disabled]="currentPage() >= totalPages()"
            >
              Siguiente
            </button>
          </div>
        </footer>
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

  onEdit(dominio: string): void {
    void this.router.navigate([`/${dominio}/editar`]);
  }

  onDelete(dominio: string): void {
    const shouldDelete = globalThis.confirm(
      `Se eliminara el automotor ${dominio}. Esta accion no se puede deshacer.`,
    );

    if (!shouldDelete) {
      return;
    }

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

  sortIndicator(field: AutomotoresSortField): string {
    const currentSort = this.facade.sort();

    if (currentSort.field !== field) {
      return '';
    }

    return currentSort.direction === 'asc' ? '(asc)' : '(desc)';
  }

  editButtonId(dominio: string): string {
    return `automotor-${dominio}-edit`;
  }

  deleteButtonId(dominio: string): string {
    return `automotor-${dominio}-delete`;
  }
}

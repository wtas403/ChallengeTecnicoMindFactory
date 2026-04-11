import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  LucideIconProvider,
  LUCIDE_ICONS,
  RotateCw,
  Search,
  TriangleAlert,
  X,
} from 'lucide-angular';
import { ApiError } from '../../../core/http/api-error';
import { AutomotoresListFacade } from '../application/facades/automotores-list-facade';
import { Automotor } from '../domain/models/automotor';
import { AutomotoresPage } from '../domain/types/automotores-page';
import { AutomotoresSort } from '../domain/types/automotores-sort';
import { AutomotoresList } from './automotores-list';

function createAutomotorFixture(dominio: string): Automotor {
  return {
    dominio,
    chasis: `CH-${dominio}`,
    motor: `MO-${dominio}`,
    color: 'Negro',
    fechaFabricacion: '202401',
    titular: {
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    },
  };
}

function createFacadeMock() {
  const automotoresState = signal<readonly Automotor[]>([]);
  const loadStatusState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  const errorState = signal<ApiError | null>(null);
  const isRefreshingState = signal(false);
  const filtersState = signal({ searchTerm: '' });
  const sortState = signal<AutomotoresSort>({ field: 'dominio', direction: 'asc' });
  const pageState = signal<AutomotoresPage>({ page: 1, pageSize: 10 });

  const totalItems = computed(() => automotoresState().length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems() / pageState().pageSize)));
  const currentPage = computed(() => Math.min(pageState().page, totalPages()));

  return {
    automotoresState,
    loadStatusState,
    errorState,
    pageState,
      facade: {
        automotores: automotoresState,
        loadStatus: loadStatusState,
        isLoading: computed(() => loadStatusState() === 'loading'),
        isRefreshing: isRefreshingState,
        hasError: computed(() => loadStatusState() === 'error' && errorState() !== null),
        error: errorState,
        isEmpty: computed(() => loadStatusState() === 'success' && automotoresState().length === 0),
      filters: filtersState,
      sort: sortState,
      page: pageState,
      currentPage,
      totalItems,
      totalPages,
      deletingDominios: signal<readonly string[]>([]),
      load: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn().mockResolvedValue(undefined),
      setSearchTerm: vi.fn(),
      toggleSort: vi.fn(),
      setPage: vi.fn(),
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      setPageSize: vi.fn(),
      isDeletingDominio: vi.fn().mockReturnValue(false),
      deleteByDominio: vi.fn().mockResolvedValue(undefined),
    },
  };
}

const lucideProviders = [
  {
    provide: LUCIDE_ICONS,
    multi: true,
    useValue: new LucideIconProvider({
      Search,
      RotateCw,
      X,
      ArrowUp,
      ArrowDown,
      ArrowUpDown,
      TriangleAlert,
    }),
  },
];

describe('AutomotoresList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('carga automotores al iniciar el componente', async () => {
    const facadeMock = createFacadeMock();

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    expect(facadeMock.facade.load).toHaveBeenCalledTimes(1);
  });

  it('muestra estado loading', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('loading');

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cargando automotores...');
  });

  it('muestra estado empty', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('success');
    facadeMock.automotoresState.set([]);

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay automotores');
  });

  it('muestra estado error con mensaje accionable', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('error');
    facadeMock.errorState.set(new ApiError(503, 'Servicio no disponible'));

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Servicio no disponible');
    expect(compiled.textContent).toContain('Reintentar');
  });

  it('renderiza tabla con filas cuando hay automotores', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('success');
    facadeMock.automotoresState.set([
      createAutomotorFixture('AA123BB'),
      createAutomotorFixture('ZZ999ZZ'),
    ]);

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    const searchInput = compiled.querySelector<HTMLInputElement>('#automotores-search');
    const reloadButton = compiled.querySelector<HTMLButtonElement>('#automotores-reload');
    const table = compiled.querySelector<HTMLTableElement>('#automotores-table');
    const editButton = compiled.querySelector<HTMLButtonElement>('#automotor-AA123BB-edit');
    const deleteButton = compiled.querySelector<HTMLButtonElement>('#automotor-AA123BB-delete');

    expect(rows.length).toBe(2);
    expect(searchInput).not.toBeNull();
    expect(searchInput?.getAttribute('placeholder')).toBe('AA123BB o 20123456786');
    expect(reloadButton).not.toBeNull();
    expect(table).not.toBeNull();
    expect(editButton).not.toBeNull();
    expect(deleteButton).not.toBeNull();
    expect(compiled.textContent).toContain('AA123BB');
    expect(compiled.textContent).toContain('ZZ999ZZ');
  });

  it('renderiza controles de paginacion y delega cambio de pagina', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('success');
    facadeMock.pageState.set({ page: 2, pageSize: 5 });
    facadeMock.automotoresState.set([
      createAutomotorFixture('AA123BB'),
      createAutomotorFixture('AB123CD'),
      createAutomotorFixture('AC123DE'),
      createAutomotorFixture('AD123EF'),
      createAutomotorFixture('AE123FG'),
      createAutomotorFixture('AF123GH'),
      createAutomotorFixture('AG123HI'),
      createAutomotorFixture('AH123IJ'),
      createAutomotorFixture('AI123JK'),
      createAutomotorFixture('AJ123KL'),
      createAutomotorFixture('AK123LM'),
    ]);

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const pageIndicator = compiled.querySelector<HTMLElement>('#automotores-page-indicator');
    const firstButton = compiled.querySelector<HTMLButtonElement>('#automotores-page-first');
    const previousButton = compiled.querySelector<HTMLButtonElement>('#automotores-page-previous');
    const nextButton = compiled.querySelector<HTMLButtonElement>('#automotores-page-next');
    const lastButton = compiled.querySelector<HTMLButtonElement>('#automotores-page-last');
    const pageThreeButton = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === '3',
    );
    const pageSizeSelect = compiled.querySelector<HTMLSelectElement>('#automotores-page-size');

    expect(compiled.textContent).toContain('Mostrando 6-10 de 11 automotores');
    expect(pageIndicator?.textContent).toContain('Pagina 2 de 3');
    expect(firstButton?.disabled).toBe(false);
    expect(previousButton?.disabled).toBe(false);
    expect(nextButton?.disabled).toBe(false);
    expect(lastButton?.disabled).toBe(false);
    expect(pageThreeButton).not.toBeUndefined();
    expect(pageSizeSelect).not.toBeNull();

    firstButton?.click();
    previousButton?.click();
    nextButton?.click();
    lastButton?.click();
    pageThreeButton?.click();
    pageSizeSelect!.value = '20';
    pageSizeSelect?.dispatchEvent(new Event('change'));

    expect(facadeMock.facade.setPage).toHaveBeenCalledWith(1);
    expect(facadeMock.facade.previousPage).toHaveBeenCalledTimes(1);
    expect(facadeMock.facade.nextPage).toHaveBeenCalledTimes(1);
    expect(facadeMock.facade.setPage).toHaveBeenCalledWith(3);
    expect(facadeMock.facade.setPageSize).toHaveBeenCalledWith(20);
  });

  it('abre y confirma el modal de eliminacion', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('success');
    facadeMock.automotoresState.set([createAutomotorFixture('AA123BB')]);

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector<HTMLButtonElement>('#automotor-AA123BB-delete');

    deleteButton?.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector<HTMLElement>('#automotor-delete-confirmation-dialog');
    const confirmButton = compiled.querySelector<HTMLButtonElement>('#automotor-delete-confirm');

    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Confirmar eliminacion');
    expect(dialog?.textContent).toContain('AA123BB');

    confirmButton?.click();

    expect(facadeMock.facade.deleteByDominio).toHaveBeenCalledWith('AA123BB');
  });

  it('muestra estado de sincronizacion durante recarga', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('success');
    facadeMock.automotoresState.set([createAutomotorFixture('AA123BB')]);
    facadeMock.facade.isRefreshing.set(true);

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
        ...lucideProviders,
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const reloadButton = compiled.querySelector<HTMLButtonElement>('#automotores-reload');

    expect(compiled.textContent).toContain('Sincronizando datos...');
    expect(reloadButton?.getAttribute('aria-busy')).toBe('true');
    expect(reloadButton?.disabled).toBe(true);
  });
});

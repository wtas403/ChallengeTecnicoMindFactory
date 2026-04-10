import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';
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
    facade: {
      automotores: automotoresState,
      loadStatus: loadStatusState,
      isLoading: computed(() => loadStatusState() === 'loading'),
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
        {
          provide: AutomotoresListFacade,
          useValue: facadeMock.facade,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomotoresList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay automotores para los filtros seleccionados.');
  });

  it('muestra estado error con mensaje accionable', async () => {
    const facadeMock = createFacadeMock();
    facadeMock.loadStatusState.set('error');
    facadeMock.errorState.set(new ApiError(503, 'Servicio no disponible'));

    await TestBed.configureTestingModule({
      imports: [AutomotoresList],
      providers: [
        provideRouter([]),
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
    const table = compiled.querySelector<HTMLTableElement>('#automotores-table');
    const editButton = compiled.querySelector<HTMLButtonElement>('#automotor-AA123BB-edit');
    const deleteButton = compiled.querySelector<HTMLButtonElement>('#automotor-AA123BB-delete');

    expect(rows.length).toBe(2);
    expect(searchInput).not.toBeNull();
    expect(table).not.toBeNull();
    expect(editButton).not.toBeNull();
    expect(deleteButton).not.toBeNull();
    expect(compiled.textContent).toContain('AA123BB');
    expect(compiled.textContent).toContain('ZZ999ZZ');
  });
});

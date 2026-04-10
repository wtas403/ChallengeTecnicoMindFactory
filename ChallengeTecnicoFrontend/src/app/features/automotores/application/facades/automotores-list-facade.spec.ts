import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from '../../../../core/http/api-error';
import { Automotor } from '../../domain/models/automotor';
import {
  AUTOMOTORES_REPOSITORY,
  AutomotoresRepository,
} from '../../infrastructure/repositories/automotores-repository';
import { AutomotoresStore } from '../stores/automotores-store';
import { AutomotoresListFacade } from './automotores-list-facade';

describe('AutomotoresListFacade', () => {
  let facade: AutomotoresListFacade;

  const repositoryMock: AutomotoresRepository = {
    list: vi.fn(),
    getByDominio: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const automotoresFixture: readonly Automotor[] = [
    {
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      titular: {
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      },
    },
    {
      dominio: 'ZZ123ZZ',
      chasis: 'CH-002',
      motor: 'MO-002',
      color: 'Blanco',
      fechaFabricacion: '202402',
      titular: {
        cuit: '27333333334',
        nombreCompleto: 'Ana Gomez',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AutomotoresStore,
        AutomotoresListFacade,
        {
          provide: AUTOMOTORES_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    });

    facade = TestBed.inject(AutomotoresListFacade);
  });

  it('carga automotores y deja estado success', async () => {
    vi.mocked(repositoryMock.list).mockResolvedValue(automotoresFixture);

    const loadPromise = facade.load();
    expect(facade.isLoading()).toBe(true);

    await loadPromise;

    expect(facade.loadStatus()).toBe('success');
    expect(facade.automotores()).toHaveLength(2);
    expect(facade.isEmpty()).toBe(false);
    expect(facade.hasError()).toBe(false);
  });

  it('mapea error al cargar automotores', async () => {
    vi.mocked(repositoryMock.list).mockRejectedValue(new ApiError(503, 'Servicio no disponible'));

    await facade.load();

    expect(facade.loadStatus()).toBe('error');
    expect(facade.hasError()).toBe(true);
    expect(facade.error()?.message).toBe('Servicio no disponible');
  });

  it('filtra, ordena y pagina en memoria', async () => {
    vi.mocked(repositoryMock.list).mockResolvedValue(automotoresFixture);

    await facade.load();

    facade.setSearchTerm('zz123');
    expect(facade.totalItems()).toBe(1);
    expect(facade.automotores()[0]?.dominio).toBe('ZZ123ZZ');

    facade.setSearchTerm('');
    facade.toggleSort('titular');
    expect(facade.automotores()[0]?.titular.nombreCompleto).toBe('Ana Gomez');

    facade.setPageSize(1);
    facade.nextPage();
    expect(facade.currentPage()).toBe(2);
    expect(facade.automotores()[0]?.dominio).toBe('AA123BB');
  });
});

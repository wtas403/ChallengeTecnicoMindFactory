import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from '../../../../core/http/api-error';
import { AutomotorDraft } from '../../domain/models/automotor-draft';
import {
  AUTOMOTORES_REPOSITORY,
  AutomotoresRepository,
} from '../../infrastructure/repositories/automotores-repository';
import {
  TITULARES_REPOSITORY,
  TitularesRepository,
} from '../../infrastructure/repositories/titulares-repository';
import { AutomotorFormStore } from '../stores/automotor-form-store';
import { AutomotorFormFacade } from './automotor-form-facade';

describe('AutomotorFormFacade', () => {
  let facade: AutomotorFormFacade;

  const automotoresRepositoryMock: AutomotoresRepository = {
    list: vi.fn(),
    getByDominio: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const titularesRepositoryMock: TitularesRepository = {
    getByCuit: vi.fn(),
    create: vi.fn(),
  };

  const draftFixture: AutomotorDraft = {
    dominio: 'AA123BB',
    chasis: 'CH-001',
    motor: 'MO-001',
    color: 'Negro',
    fechaFabricacion: '202401',
    cuitTitular: '20123456786',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AutomotorFormStore,
        AutomotorFormFacade,
        {
          provide: AUTOMOTORES_REPOSITORY,
          useValue: automotoresRepositoryMock,
        },
        {
          provide: TITULARES_REPOSITORY,
          useValue: titularesRepositoryMock,
        },
      ],
    });

    facade = TestBed.inject(AutomotorFormFacade);
  });

  it('inicializa el formulario en modo create', () => {
    facade.initializeForCreate();

    expect(facade.mode()).toBe('create');
    expect(facade.isLoading()).toBe(false);
  });

  it('bloquea el submit si el titular no existe', async () => {
    vi.mocked(titularesRepositoryMock.getByCuit).mockResolvedValue(null);

    const isSuccess = await facade.create(draftFixture);

    expect(isSuccess).toBe(false);
    expect(automotoresRepositoryMock.create).not.toHaveBeenCalled();
    expect(facade.titularLookupStatus()).toBe('not-found');
    expect(facade.isTitularCreationVisible()).toBe(true);
    expect(facade.fieldErrors()).toEqual([
      {
        field: 'nombreTitular',
        message:
          'No existe un sujeto para este CUIT. Completa el nombre para crearlo junto al automotor.',
      },
    ]);
  });

  it('crea automotor cuando el titular existe', async () => {
    vi.mocked(titularesRepositoryMock.getByCuit).mockResolvedValue({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
    vi.mocked(automotoresRepositoryMock.create).mockResolvedValue({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      titular: {
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      },
    });

    const isSuccess = await facade.create(draftFixture);

    expect(isSuccess).toBe(true);
    expect(automotoresRepositoryMock.create).toHaveBeenCalledWith(draftFixture);
    expect(facade.titularLookupStatus()).toBe('success');
  });

  it('expone error de API al fallar update', async () => {
    vi.mocked(titularesRepositoryMock.getByCuit).mockResolvedValue({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
    vi.mocked(automotoresRepositoryMock.update).mockRejectedValue(
      new ApiError(422, 'No se pudo actualizar', 'VALIDATION_ERROR'),
    );

    const isSuccess = await facade.update('AA123BB', draftFixture);

    expect(isSuccess).toBe(false);
    expect(facade.error()?.message).toBe('No se pudo actualizar');
  });

  it('reintenta submit pendiente enviando nombreTitular en forma atomica', async () => {
    vi.mocked(titularesRepositoryMock.getByCuit).mockResolvedValue(null);
    vi.mocked(automotoresRepositoryMock.create).mockResolvedValue({
      dominio: 'AA123BB',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      titular: {
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      },
    });

    const firstSubmitResult = await facade.create(draftFixture);
    expect(firstSubmitResult).toBe(false);

    const retryResult = await facade.createTitularAndRetry('Juan Perez');

    expect(retryResult).toBe(true);
    expect(titularesRepositoryMock.create).not.toHaveBeenCalled();
    expect(automotoresRepositoryMock.create).toHaveBeenCalledWith({
      ...draftFixture,
      nombreTitular: 'Juan Perez',
    });
    expect(facade.isTitularCreationVisible()).toBe(false);
  });

  it('reintenta con el draft pendiente mas reciente cuando se edita durante el inline', async () => {
    vi.mocked(titularesRepositoryMock.getByCuit).mockResolvedValue(null);
    vi.mocked(automotoresRepositoryMock.create).mockResolvedValue({
      dominio: 'AB123CD',
      chasis: 'CH-001',
      motor: 'MO-001',
      color: 'Negro',
      fechaFabricacion: '202401',
      titular: {
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      },
    });

    const firstSubmitResult = await facade.create(draftFixture);
    expect(firstSubmitResult).toBe(false);

    const updatedDraft: AutomotorDraft = {
      ...draftFixture,
      dominio: 'AB123CD',
    };
    facade.updatePendingDraft(updatedDraft);

    const retryResult = await facade.createTitularAndRetry('Juan Perez');

    expect(retryResult).toBe(true);
    expect(automotoresRepositoryMock.create).toHaveBeenLastCalledWith({
      ...updatedDraft,
      nombreTitular: 'Juan Perez',
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { ConflictError } from '../../../src/errors/conflict-error';
import { NotFoundError } from '../../../src/errors/not-found-error';
import { ValidationError } from '../../../src/errors/validation-error';
import { AutomotoresService } from '../../../src/services/automotores.service';
import { buildAutomotor, buildSujeto } from '../../helpers/factories';

describe('AutomotoresService', () => {
  const runTransaction = async <T>(callback: (transactionClient: never) => Promise<T>): Promise<T> =>
    callback({} as never);

  function createRepositories() {
    return {
      automotoresRepository: {
        list: vi.fn(),
        findByDominio: vi.fn(),
        findByChasis: vi.fn(),
        findByMotor: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      sujetosRepository: {
        findByCuit: vi.fn(),
        create: vi.fn(),
      },
    };
  }

  it('lista automotores', async () => {
    const repositories = createRepositories();
    const automotor = buildAutomotor();
    repositories.automotoresRepository.list.mockResolvedValue([automotor]);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(service.list()).resolves.toEqual([automotor]);
  });

  it('obtiene automotor por dominio', async () => {
    const repositories = createRepositories();
    const automotor = buildAutomotor();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(automotor);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(service.getByDominio('AA123BB')).resolves.toEqual(automotor);
  });

  it('lanza not found al buscar dominio inexistente', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(service.getByDominio('AA123BB')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('crea automotor valido con titular existente', async () => {
    const repositories = createRepositories();
    const sujeto = buildSujeto();
    const automotor = buildAutomotor();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(null);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(null);
    repositories.sujetosRepository.findByCuit.mockResolvedValue(sujeto);
    repositories.automotoresRepository.create.mockResolvedValue(automotor);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.create({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).resolves.toEqual(automotor);
  });

  it('crea automotor y crea titular cuando el cuit no existe y se informa nombreTitular', async () => {
    const repositories = createRepositories();
    const automotor = buildAutomotor();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(null);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(null);
    repositories.sujetosRepository.findByCuit.mockResolvedValue(null);
    repositories.sujetosRepository.create = vi.fn().mockResolvedValue(buildSujeto({ id: 99 }));
    repositories.automotoresRepository.create.mockResolvedValue(automotor);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.create({
        dominio: 'AC123DE',
        chasis: 'CHS-9999',
        motor: 'MTR-9999',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20333333334',
        nombreTitular: 'Ana Torres',
      }),
    ).resolves.toEqual(automotor);

    expect(repositories.sujetosRepository.create).toHaveBeenCalledWith(
      {
        cuit: '20333333334',
        nombreCompleto: 'Ana Torres',
      },
      expect.anything(),
    );
  });

  it('rechaza create si el titular no existe', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(null);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(null);
    repositories.sujetosRepository.findByCuit.mockResolvedValue(null);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.create({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza create si el dominio ya existe', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(buildAutomotor());
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.create({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rechaza create si el chasis ya existe', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(buildAutomotor());
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.create({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rechaza create si el motor ya existe', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(null);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(buildAutomotor());
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.create({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('actualiza automotor existente', async () => {
    const repositories = createRepositories();
    const existingAutomotor = buildAutomotor({ id: 10 });
    const updatedAutomotor = buildAutomotor({ color: 'Negro' });
    repositories.automotoresRepository.findByDominio.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(existingAutomotor);
    repositories.sujetosRepository.findByCuit.mockResolvedValue(buildSujeto());
    repositories.automotoresRepository.update.mockResolvedValue(updatedAutomotor);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.update('AA123BB', {
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).resolves.toEqual(updatedAutomotor);
  });

  it('actualiza automotor y crea titular si se reasigna a cuit inexistente con nombreTitular', async () => {
    const repositories = createRepositories();
    const existingAutomotor = buildAutomotor({ id: 10 });
    const updatedAutomotor = buildAutomotor({ color: 'Negro' });
    repositories.automotoresRepository.findByDominio.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(existingAutomotor);
    repositories.sujetosRepository.findByCuit.mockResolvedValue(null);
    repositories.sujetosRepository.create = vi.fn().mockResolvedValue(buildSujeto({ id: 50 }));
    repositories.automotoresRepository.update.mockResolvedValue(updatedAutomotor);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.update('AA123BB', {
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20333333334',
        nombreTitular: 'Ana Torres',
      }),
    ).resolves.toEqual(updatedAutomotor);

    expect(repositories.sujetosRepository.create).toHaveBeenCalledWith(
      {
        cuit: '20333333334',
        nombreCompleto: 'Ana Torres',
      },
      expect.anything(),
    );
  });

  it('rechaza update si el automotor no existe', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(null);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.update('AA123BB', {
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rechaza update si el chasis pertenece a otro automotor', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(buildAutomotor({ id: 10 }));
    repositories.automotoresRepository.findByChasis.mockResolvedValue(buildAutomotor({ id: 20 }));
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.update('AA123BB', {
        chasis: 'CHS-0009',
        motor: 'MTR-0001',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rechaza update si el motor pertenece a otro automotor', async () => {
    const repositories = createRepositories();
    const existingAutomotor = buildAutomotor({ id: 10 });
    repositories.automotoresRepository.findByDominio.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(buildAutomotor({ id: 20 }));
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.update('AA123BB', {
        chasis: 'CHS-0001',
        motor: 'MTR-0009',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rechaza update si el titular no existe', async () => {
    const repositories = createRepositories();
    const existingAutomotor = buildAutomotor({ id: 10 });
    repositories.automotoresRepository.findByDominio.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByChasis.mockResolvedValue(existingAutomotor);
    repositories.automotoresRepository.findByMotor.mockResolvedValue(existingAutomotor);
    repositories.sujetosRepository.findByCuit.mockResolvedValue(null);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(
      service.update('AA123BB', {
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Negro',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('elimina un automotor existente', async () => {
    const repositories = createRepositories();
    repositories.automotoresRepository.findByDominio.mockResolvedValue(buildAutomotor());
    repositories.automotoresRepository.delete.mockResolvedValue(undefined);
    const service = new AutomotoresService(
      repositories.automotoresRepository as never,
      repositories.sujetosRepository as never,
      runTransaction,
    );

    await expect(service.delete('AA123BB')).resolves.toBeUndefined();
    expect(repositories.automotoresRepository.delete).toHaveBeenCalledWith('AA123BB');
  });
});

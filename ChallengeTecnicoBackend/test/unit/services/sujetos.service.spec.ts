import { describe, expect, it, vi } from 'vitest';
import { ConflictError } from '../../../src/errors/conflict-error';
import { NotFoundError } from '../../../src/errors/not-found-error';
import { SujetosService } from '../../../src/services/sujetos.service';
import { buildSujeto } from '../../helpers/factories';

describe('SujetosService', () => {
  it('devuelve un sujeto existente por cuit', async () => {
    const sujeto = buildSujeto();
    const sujetosRepository = {
      findByCuit: vi.fn().mockResolvedValue(sujeto),
      create: vi.fn(),
    };

    const service = new SujetosService(sujetosRepository as never);

    await expect(service.getByCuit('20123456786')).resolves.toEqual(sujeto);
  });

  it('lanza not found cuando el sujeto no existe', async () => {
    const sujetosRepository = {
      findByCuit: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    };

    const service = new SujetosService(sujetosRepository as never);

    await expect(service.getByCuit('20123456786')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('crea un sujeto nuevo cuando no existe', async () => {
    const sujeto = buildSujeto();
    const sujetosRepository = {
      findByCuit: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(sujeto),
    };

    const service = new SujetosService(sujetosRepository as never);

    await expect(
      service.create({ cuit: '20123456786', nombreCompleto: 'Juan Perez' }),
    ).resolves.toEqual(sujeto);
    expect(sujetosRepository.create).toHaveBeenCalledWith({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
  });

  it('lanza conflicto si el cuit ya existe', async () => {
    const sujetosRepository = {
      findByCuit: vi.fn().mockResolvedValue(buildSujeto()),
      create: vi.fn(),
    };

    const service = new SujetosService(sujetosRepository as never);

    await expect(
      service.create({ cuit: '20123456786', nombreCompleto: 'Juan Perez' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

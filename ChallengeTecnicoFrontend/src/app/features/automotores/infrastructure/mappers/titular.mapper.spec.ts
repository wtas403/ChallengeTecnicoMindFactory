import { describe, expect, it } from 'vitest';
import { Titular } from '../../domain/models/titular';
import { mapSujetoDtoToTitular, mapTitularToCreateSujetoDto } from './titular.mapper';

describe('titular.mapper', () => {
  it('mapea SujetoDto a Titular', () => {
    expect(
      mapSujetoDtoToTitular({
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      }),
    ).toEqual<Titular>({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
  });

  it('mapea Titular a CreateSujetoDto', () => {
    expect(
      mapTitularToCreateSujetoDto({
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      }),
    ).toEqual({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
  });
});

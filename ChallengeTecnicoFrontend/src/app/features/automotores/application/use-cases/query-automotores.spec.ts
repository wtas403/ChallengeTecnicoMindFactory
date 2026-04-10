import { describe, expect, it } from 'vitest';
import { Automotor } from '../../domain/models/automotor';
import {
  calculateTotalPages,
  filterAutomotores,
  paginateAutomotores,
  sortAutomotores,
} from './query-automotores';

const AUTOMOTORES_FIXTURE: readonly Automotor[] = [
  {
    dominio: 'AA123BB',
    chasis: 'CH-001',
    motor: 'MO-001',
    color: 'Negro',
    fechaFabricacion: '202312',
    titular: {
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    },
  },
  {
    dominio: 'AB999CD',
    chasis: 'CH-002',
    motor: 'MO-002',
    color: 'Blanco',
    fechaFabricacion: '202201',
    titular: {
      cuit: '27333333334',
      nombreCompleto: 'Ana Gomez',
    },
  },
  {
    dominio: 'ZZ123ZZ',
    chasis: 'CH-003',
    motor: 'MO-003',
    color: 'Rojo',
    fechaFabricacion: '202405',
    titular: {
      cuit: '20987654321',
      nombreCompleto: 'Zoe Alvarez',
    },
  },
];

describe('query-automotores', () => {
  it('filtra por dominio', () => {
    const filtered = filterAutomotores(AUTOMOTORES_FIXTURE, { searchTerm: 'ab999' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.dominio).toBe('AB999CD');
  });

  it('filtra por cuit', () => {
    const filtered = filterAutomotores(AUTOMOTORES_FIXTURE, { searchTerm: '987654321' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.dominio).toBe('ZZ123ZZ');
  });

  it('ordena por titular en sentido ascendente', () => {
    const sorted = sortAutomotores(AUTOMOTORES_FIXTURE, {
      field: 'titular',
      direction: 'asc',
    });

    expect(sorted.map((automotor) => automotor.titular.nombreCompleto)).toEqual([
      'Ana Gomez',
      'Juan Perez',
      'Zoe Alvarez',
    ]);
  });

  it('pagina resultados respetando page y pageSize', () => {
    const paged = paginateAutomotores(AUTOMOTORES_FIXTURE, {
      page: 2,
      pageSize: 2,
    });

    expect(paged).toHaveLength(1);
    expect(paged[0]?.dominio).toBe('ZZ123ZZ');
  });

  it('calcula un minimo de 1 pagina aunque no haya items', () => {
    expect(calculateTotalPages(0, 10)).toBe(1);
  });
});

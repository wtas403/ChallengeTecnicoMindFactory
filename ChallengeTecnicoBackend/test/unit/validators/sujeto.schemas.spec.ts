import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../src/errors/validation-error';
import { parseCreateSujetoInput, parseCuitQuery } from '../../../src/validators/sujeto.schemas';

describe('sujeto.schemas', () => {
  it('parsea y normaliza el create sujeto input', () => {
    expect(
      parseCreateSujetoInput({
        cuit: '20-12345678-6',
        nombreCompleto: ' Juan Perez ',
      }),
    ).toEqual({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
  });

  it('rechaza un cuit invalido', () => {
    expect(() =>
      parseCreateSujetoInput({
        cuit: '20123456780',
        nombreCompleto: 'Juan Perez',
      }),
    ).toThrowError(ValidationError);
  });

  it('rechaza nombre completo vacio', () => {
    try {
      parseCreateSujetoInput({ cuit: '20123456786', nombreCompleto: '   ' });
      throw new Error('expected validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toContainEqual({
        field: 'nombreCompleto',
        message: 'El nombre completo es obligatorio.',
      });
    }
  });

  it('parsea y normaliza el cuit de query', () => {
    expect(parseCuitQuery({ cuit: '20-12345678-6' })).toBe('20123456786');
  });

  it('rechaza query sin cuit', () => {
    expect(() => parseCuitQuery({})).toThrowError(ValidationError);
  });
});

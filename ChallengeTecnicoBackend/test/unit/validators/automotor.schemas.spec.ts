import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../src/errors/validation-error';
import {
  parseCreateAutomotorInput,
  parseDominioParam,
  parseUpdateAutomotorInput,
} from '../../../src/validators/automotor.schemas';

describe('automotor.schemas', () => {
  it('parsea create input y normaliza dominio y cuit', () => {
    expect(
      parseCreateAutomotorInput({
        dominio: ' aa123bb ',
        chasis: ' CHS-0001 ',
        motor: ' MTR-0001 ',
        color: ' Rojo ',
        fechaFabricacion: '202401',
        cuitTitular: '20-12345678-6',
        nombreTitular: '  Juan Perez  ',
      }),
    ).toEqual({
      dominio: 'AA123BB',
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Rojo',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
      nombreTitular: 'Juan Perez',
    });
  });

  it('rechaza nombreTitular vacio cuando se informa', () => {
    expect(() =>
      parseCreateAutomotorInput({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
        nombreTitular: '   ',
      }),
    ).toThrowError(ValidationError);
  });

  it('rechaza dominio invalido', () => {
    expect(() =>
      parseCreateAutomotorInput({
        dominio: 'INVALIDO',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456786',
      }),
    ).toThrowError(ValidationError);
  });

  it('rechaza cuit de titular invalido', () => {
    expect(() =>
      parseCreateAutomotorInput({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '202401',
        cuitTitular: '20123456780',
      }),
    ).toThrowError(ValidationError);
  });

  it('rechaza fecha de fabricacion futura', () => {
    expect(() =>
      parseCreateAutomotorInput({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
        color: 'Rojo',
        fechaFabricacion: '209901',
        cuitTitular: '20123456786',
      }),
    ).toThrowError(ValidationError);
  });

  it('parsea update input sin dominio', () => {
    expect(
      parseUpdateAutomotorInput({
        chasis: ' CHS-0001 ',
        motor: ' MTR-0001 ',
        color: ' Rojo ',
        fechaFabricacion: '202401',
        cuitTitular: '20-12345678-6',
      }),
    ).toEqual({
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Rojo',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });
  });

  it('parsea dominio de params', () => {
    expect(parseDominioParam({ dominio: 'aa123bb' })).toBe('AA123BB');
  });

  it('rechaza dominio invalido en params', () => {
    expect(() => parseDominioParam({ dominio: '123' })).toThrowError(ValidationError);
  });
});

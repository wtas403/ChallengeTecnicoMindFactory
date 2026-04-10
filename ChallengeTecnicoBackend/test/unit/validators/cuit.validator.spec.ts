import { describe, expect, it } from 'vitest';
import { isCuitValid, normalizeCuit } from '../../../src/validators/cuit.validator';

describe('cuit.validator', () => {
  it('normaliza cuit removiendo caracteres no numericos', () => {
    expect(normalizeCuit('20-12345678-6')).toBe('20123456786');
  });

  it('acepta un cuit valido', () => {
    expect(isCuitValid('20123456786')).toBe(true);
  });

  it('rechaza un cuit con digito verificador invalido', () => {
    expect(isCuitValid('20123456780')).toBe(false);
  });

  it('rechaza un cuit con longitud invalida', () => {
    expect(isCuitValid('2012345678')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { isDominioValid, normalizeDominio } from '../../../src/validators/dominio.validator';

describe('dominio.validator', () => {
  it('normaliza el dominio a mayusculas y sin espacios', () => {
    expect(normalizeDominio(' aa123bb ')).toBe('AA123BB');
  });

  it('acepta dominios con formato AAA999', () => {
    expect(isDominioValid('AAA999')).toBe(true);
  });

  it('acepta dominios con formato AA999AA', () => {
    expect(isDominioValid('aa123bb')).toBe(true);
  });

  it('rechaza dominios invalidos', () => {
    expect(isDominioValid('A123BCD')).toBe(false);
    expect(isDominioValid('1234567')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { isDominioValid, normalizeDominio } from './dominio.validator';

describe('dominio.validator', () => {
  it('normaliza dominio a mayusculas y sin espacios extremos', () => {
    expect(normalizeDominio('  aa123aa  ')).toBe('AA123AA');
  });

  it('valida dominio con formato AAA999', () => {
    expect(isDominioValid('ABC123')).toBe(true);
  });

  it('valida dominio con formato AA999AA', () => {
    expect(isDominioValid('AB123CD')).toBe(true);
  });

  it('acepta minusculas por normalizacion', () => {
    expect(isDominioValid('ab123cd')).toBe(true);
  });

  it('rechaza dominios con formato invalido', () => {
    expect(isDominioValid('A123BCD')).toBe(false);
    expect(isDominioValid('AB1234')).toBe(false);
    expect(isDominioValid('AB 123CD')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { isFechaFabricacionValid } from './fecha-fabricacion.validator';

describe('fecha-fabricacion.validator', () => {
  const fixedToday = new Date(2026, 3, 9);

  it('valida fechas con formato YYYYMM no futuras', () => {
    expect(isFechaFabricacionValid('202604', fixedToday)).toBe(true);
    expect(isFechaFabricacionValid('202512', fixedToday)).toBe(true);
  });

  it('rechaza formato que no sea 6 digitos', () => {
    expect(isFechaFabricacionValid('20264', fixedToday)).toBe(false);
    expect(isFechaFabricacionValid('2026-04', fixedToday)).toBe(false);
  });

  it('rechaza meses fuera de rango', () => {
    expect(isFechaFabricacionValid('202600', fixedToday)).toBe(false);
    expect(isFechaFabricacionValid('202613', fixedToday)).toBe(false);
  });

  it('rechaza fechas futuras', () => {
    expect(isFechaFabricacionValid('202605', fixedToday)).toBe(false);
  });
});

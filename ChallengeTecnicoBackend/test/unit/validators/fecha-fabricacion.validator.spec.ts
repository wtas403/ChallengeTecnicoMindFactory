import { describe, expect, it } from 'vitest';
import { isFechaFabricacionValid } from '../../../src/validators/fecha-fabricacion.validator';

describe('fecha-fabricacion.validator', () => {
  const fixedToday = new Date(2026, 3, 10);

  it('acepta una fecha valida no futura', () => {
    expect(isFechaFabricacionValid('202604', fixedToday)).toBe(true);
    expect(isFechaFabricacionValid('202401', fixedToday)).toBe(true);
  });

  it('rechaza meses fuera de rango', () => {
    expect(isFechaFabricacionValid('202600', fixedToday)).toBe(false);
    expect(isFechaFabricacionValid('202613', fixedToday)).toBe(false);
  });

  it('rechaza formatos invalidos', () => {
    expect(isFechaFabricacionValid('2026-04', fixedToday)).toBe(false);
    expect(isFechaFabricacionValid('20264', fixedToday)).toBe(false);
  });

  it('rechaza fechas futuras', () => {
    expect(isFechaFabricacionValid('202605', fixedToday)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { isCuitValid, normalizeCuit } from './cuit.validator';

describe('cuit.validator', () => {
  it('normaliza CUIT removiendo caracteres no numericos', () => {
    expect(normalizeCuit('20-12345678-6')).toBe('20123456786');
  });

  it('valida CUIT con formato numerico puro', () => {
    expect(isCuitValid('20123456786')).toBe(true);
  });

  it('valida CUIT con guiones', () => {
    expect(isCuitValid('20-12345678-6')).toBe(true);
  });

  it('rechaza CUIT con longitud invalida', () => {
    expect(isCuitValid('2012345678')).toBe(false);
    expect(isCuitValid('201234567860')).toBe(false);
  });

  it('rechaza CUIT con caracteres invalidos', () => {
    expect(isCuitValid('20A123456786')).toBe(false);
  });

  it('rechaza CUIT con digito verificador incorrecto', () => {
    expect(isCuitValid('20123456780')).toBe(false);
  });
});

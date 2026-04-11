import { expect, test } from '@playwright/test';
import { uniqueValidCuit } from '../support/test-data';

function apiBaseUrl(): string {
  return process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
}

test.describe('Sujetos API - e2e', () => {
  test('consulta por CUIT existente, inexistente e invalido', async ({ request }) => {
    const existing = await request.get(`${apiBaseUrl()}/api/sujetos/by-cuit`, {
      params: { cuit: '20123456786' },
    });
    expect(existing.status()).toBe(200);
    await expect(existing.json()).resolves.toEqual({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });

    const notFound = await request.get(`${apiBaseUrl()}/api/sujetos/by-cuit`, {
      params: { cuit: uniqueValidCuit() },
    });
    expect(notFound.status()).toBe(404);
    await expect(notFound.json()).resolves.toMatchObject({
      code: 'SUJETO_NOT_FOUND',
    });

    const invalid = await request.get(`${apiBaseUrl()}/api/sujetos/by-cuit`, {
      params: { cuit: '20123456780' },
    });
    expect(invalid.status()).toBe(422);
    await expect(invalid.json()).resolves.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  test('crea sujeto y devuelve conflicto al duplicar', async ({ request }) => {
    const cuit = uniqueValidCuit();

    const created = await request.post(`${apiBaseUrl()}/api/sujetos`, {
      data: {
        cuit,
        nombreCompleto: 'Titular API E2E',
      },
    });
    expect(created.status()).toBe(201);
    await expect(created.json()).resolves.toEqual({
      cuit,
      nombreCompleto: 'Titular API E2E',
    });

    const duplicated = await request.post(`${apiBaseUrl()}/api/sujetos`, {
      data: {
        cuit,
        nombreCompleto: 'Titular API E2E',
      },
    });
    expect(duplicated.status()).toBe(409);
    await expect(duplicated.json()).resolves.toMatchObject({
      code: 'SUJETO_ALREADY_EXISTS',
    });
  });
});

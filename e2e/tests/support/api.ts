import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import type { AutomotorDraft } from './test-data';

function apiBaseUrl(): string {
  return process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
}

export async function createAutomotor(
  request: APIRequestContext,
  draft: AutomotorDraft,
): Promise<APIResponse> {
  const response = await request.post(`${apiBaseUrl()}/api/automotores`, {
    data: {
      dominio: draft.dominio,
      chasis: draft.chasis,
      motor: draft.motor,
      color: draft.color,
      fechaFabricacion: draft.fechaFabricacion,
      cuitTitular: draft.cuitTitular,
    },
  });

  expect(response.status()).toBe(201);
  return response;
}

export async function createSujeto(
  request: APIRequestContext,
  sujeto: { cuit: string; nombreCompleto: string },
): Promise<void> {
  const response = await request.post(`${apiBaseUrl()}/api/sujetos`, {
    data: {
      cuit: sujeto.cuit,
      nombreCompleto: sujeto.nombreCompleto,
    },
  });

  if (response.status() === 409) {
    return;
  }

  expect(response.status()).toBe(201);
}

export async function deleteAutomotor(request: APIRequestContext, dominio: string): Promise<void> {
  const response = await request.delete(
    `${apiBaseUrl()}/api/automotores/${encodeURIComponent(dominio)}`,
  );

  if (response.status() === 404) {
    return;
  }

  expect(response.status()).toBe(204);
}

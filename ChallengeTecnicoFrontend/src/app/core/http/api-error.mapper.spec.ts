import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { mapHttpErrorToApiError } from './api-error.mapper';

describe('api-error.mapper', () => {
  it('mapea errores 422 con detalle por campo', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'No se pudo procesar la solicitud',
        errors: [
          {
            field: 'dominio',
            message: 'El dominio ya existe',
          },
        ],
      },
    });

    const mappedError = mapHttpErrorToApiError(error);

    expect(mappedError.status).toBe(422);
    expect(mappedError.code).toBe('VALIDATION_ERROR');
    expect(mappedError.message).toBe('No se pudo procesar la solicitud');
    expect(mappedError.fieldErrors).toEqual([
      {
        field: 'dominio',
        message: 'El dominio ya existe',
      },
    ]);
  });

  it('mapea errores 404 sin detalle de campo', () => {
    const error = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: {
        message: 'Sujeto no encontrado',
      },
    });

    const mappedError = mapHttpErrorToApiError(error);

    expect(mappedError.status).toBe(404);
    expect(mappedError.message).toBe('Sujeto no encontrado');
    expect(mappedError.fieldErrors).toEqual([]);
  });

  it('mapea errores desconocidos a estado 0', () => {
    const mappedError = mapHttpErrorToApiError(new Error('unexpected'));

    expect(mappedError.status).toBe(0);
    expect(mappedError.message).toBe('Error inesperado al procesar la solicitud.');
  });
});

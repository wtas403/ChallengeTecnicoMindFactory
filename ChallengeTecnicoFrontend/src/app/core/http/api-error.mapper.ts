import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiFieldError } from './api-error';
import { ApiErrorResponseDto } from './api-error-response.dto';

function isApiErrorResponseDto(value: unknown): value is ApiErrorResponseDto {
  return typeof value === 'object' && value !== null;
}

function mapFieldErrors(errorResponse: ApiErrorResponseDto): readonly ApiFieldError[] {
  const errors = errorResponse.errors;

  if (!errors) {
    return [];
  }

  return errors
    .filter((error): error is ApiFieldError => Boolean(error?.field && error?.message))
    .map((error) => ({ field: error.field, message: error.message }));
}

export function mapHttpErrorToApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return new ApiError(0, 'Error inesperado al procesar la solicitud.');
  }

  const errorResponse = isApiErrorResponseDto(error.error) ? error.error : undefined;
  const messageFromResponse = errorResponse?.message;
  const message =
    typeof messageFromResponse === 'string' && messageFromResponse.trim().length > 0
      ? messageFromResponse
      : error.message;

  const code = typeof errorResponse?.code === 'string' ? errorResponse.code : undefined;

  return new ApiError(error.status, message, code, mapFieldErrors(errorResponse ?? {}));
}

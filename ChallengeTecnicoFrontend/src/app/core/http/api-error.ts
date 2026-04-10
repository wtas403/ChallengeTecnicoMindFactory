export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly fieldErrors: readonly ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

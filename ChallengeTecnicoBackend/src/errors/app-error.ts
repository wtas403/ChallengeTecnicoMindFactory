import { ApiErrorDetailDto } from '../types/api-error-response';

export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly errors: readonly ApiErrorDetailDto[] = [],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

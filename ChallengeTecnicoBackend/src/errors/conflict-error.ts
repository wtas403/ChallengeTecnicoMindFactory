import { AppError } from './app-error';
import { ApiErrorDetailDto } from '../types/api-error-response';

export class ConflictError extends AppError {
  constructor(message: string, errors: readonly ApiErrorDetailDto[] = [], code = 'CONFLICT') {
    super(409, message, code, errors);
    this.name = 'ConflictError';
  }
}

import { AppError } from './app-error';
import { ApiErrorDetailDto } from '../types/api-error-response';

export class ValidationError extends AppError {
  constructor(message: string, errors: readonly ApiErrorDetailDto[], code = 'VALIDATION_ERROR') {
    super(422, message, code, errors);
    this.name = 'ValidationError';
  }
}

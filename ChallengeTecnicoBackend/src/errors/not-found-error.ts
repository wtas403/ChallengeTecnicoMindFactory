import { AppError } from './app-error';

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}

import { ZodError } from 'zod';
import { ApiErrorDetailDto } from '../types/api-error-response';

export function mapZodError(error: ZodError): readonly ApiErrorDetailDto[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'request',
    message: issue.message,
  }));
}

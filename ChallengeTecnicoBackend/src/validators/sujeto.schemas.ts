import { z } from 'zod';
import { ValidationError } from '../errors/validation-error';
import { isCuitValid, normalizeCuit } from './cuit.validator';
import { mapZodError } from './request.utils';

const createSujetoSchema = z.object({
  cuit: z.string().trim().min(1, 'El CUIT es obligatorio.'),
  nombreCompleto: z.string().trim().min(1, 'El nombre completo es obligatorio.').max(120),
});

export interface CreateSujetoInput {
  readonly cuit: string;
  readonly nombreCompleto: string;
}

export function parseCreateSujetoInput(input: unknown): CreateSujetoInput {
  const result = createSujetoSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  const normalizedCuit = normalizeCuit(result.data.cuit);

  if (!isCuitValid(normalizedCuit)) {
    throw new ValidationError('Hay errores de validacion.', [
      { field: 'cuit', message: 'El CUIT informado no es valido.' },
    ]);
  }

  return {
    cuit: normalizedCuit,
    nombreCompleto: result.data.nombreCompleto.trim(),
  };
}

export function parseCuitQuery(input: unknown): string {
  const result = z.object({ cuit: z.string().trim().min(1, 'El CUIT es obligatorio.') }).safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  const normalizedCuit = normalizeCuit(result.data.cuit);

  if (!isCuitValid(normalizedCuit)) {
    throw new ValidationError('Hay errores de validacion.', [
      { field: 'cuit', message: 'El CUIT informado no es valido.' },
    ]);
  }

  return normalizedCuit;
}

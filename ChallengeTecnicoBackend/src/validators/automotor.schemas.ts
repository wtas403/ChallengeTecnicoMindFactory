import { z } from 'zod';
import { ValidationError } from '../errors/validation-error';
import { isCuitValid, normalizeCuit } from './cuit.validator';
import { isDominioValid, normalizeDominio } from './dominio.validator';
import { isFechaFabricacionValid } from './fecha-fabricacion.validator';
import { mapZodError } from './request.utils';

const createAutomotorSchema = z.object({
  dominio: z.string().trim().min(1, 'El dominio es obligatorio.'),
  chasis: z.string().trim().min(1, 'El chasis es obligatorio.').max(50),
  motor: z.string().trim().min(1, 'El motor es obligatorio.').max(50),
  color: z.string().trim().min(1, 'El color es obligatorio.').max(50),
  fechaFabricacion: z.string().trim().min(1, 'La fecha de fabricacion es obligatoria.'),
  cuitTitular: z.string().trim().min(1, 'El CUIT del titular es obligatorio.'),
  nombreTitular: z.string().trim().min(1, 'El nombre del titular es obligatorio.').max(120).optional(),
});

const updateAutomotorSchema = createAutomotorSchema.omit({ dominio: true });

export interface CreateAutomotorInput {
  readonly dominio: string;
  readonly chasis: string;
  readonly motor: string;
  readonly color: string;
  readonly fechaFabricacion: string;
  readonly cuitTitular: string;
  readonly nombreTitular?: string;
}

export interface UpdateAutomotorInput {
  readonly chasis: string;
  readonly motor: string;
  readonly color: string;
  readonly fechaFabricacion: string;
  readonly cuitTitular: string;
  readonly nombreTitular?: string;
}

function validateFechaFabricacion(fechaFabricacion: string): void {
  if (!isFechaFabricacionValid(fechaFabricacion)) {
    throw new ValidationError('Hay errores de validacion.', [
      {
        field: 'fechaFabricacion',
        message: 'La fecha de fabricacion debe tener formato YYYYMM y no puede ser futura.',
      },
    ]);
  }
}

function normalizeCommonFields<
  T extends {
    chasis: string;
    motor: string;
    color: string;
    fechaFabricacion: string;
    cuitTitular: string;
    nombreTitular?: string;
  },
>(
  data: T,
): T {
  const cuitTitular = normalizeCuit(data.cuitTitular);

  if (!isCuitValid(cuitTitular)) {
    throw new ValidationError('Hay errores de validacion.', [
      { field: 'cuitTitular', message: 'El CUIT del titular no es valido.' },
    ]);
  }

  validateFechaFabricacion(data.fechaFabricacion);

  return {
    ...data,
    chasis: data.chasis.trim(),
    motor: data.motor.trim(),
    color: data.color.trim(),
    fechaFabricacion: data.fechaFabricacion.trim(),
    cuitTitular,
    ...(data.nombreTitular ? { nombreTitular: data.nombreTitular.trim() } : {}),
  };
}

export function parseDominioParam(input: unknown): string {
  const result = z.object({ dominio: z.string().trim().min(1, 'El dominio es obligatorio.') }).safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  const dominio = normalizeDominio(result.data.dominio);

  if (!isDominioValid(dominio)) {
    throw new ValidationError('Hay errores de validacion.', [
      { field: 'dominio', message: 'El dominio debe tener formato AAA999 o AA999AA.' },
    ]);
  }

  return dominio;
}

export function parseCreateAutomotorInput(input: unknown): CreateAutomotorInput {
  const result = createAutomotorSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  const dominio = normalizeDominio(result.data.dominio);

  if (!isDominioValid(dominio)) {
    throw new ValidationError('Hay errores de validacion.', [
      { field: 'dominio', message: 'El dominio debe tener formato AAA999 o AA999AA.' },
    ]);
  }

  return {
    ...normalizeCommonFields(result.data),
    dominio,
  };
}

export function parseUpdateAutomotorInput(input: unknown): UpdateAutomotorInput {
  const result = updateAutomotorSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError('Hay errores de validacion.', mapZodError(result.error));
  }

  return normalizeCommonFields(result.data);
}

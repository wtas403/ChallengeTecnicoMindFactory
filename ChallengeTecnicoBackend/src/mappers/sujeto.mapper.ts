import { Sujeto } from '@prisma/client';

export function mapSujetoToDto(sujeto: Sujeto) {
  return {
    cuit: sujeto.cuit,
    nombreCompleto: sujeto.nombreCompleto,
  };
}

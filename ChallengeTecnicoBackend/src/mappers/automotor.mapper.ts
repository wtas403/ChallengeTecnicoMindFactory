import { Automotor, Sujeto } from '@prisma/client';
import { mapSujetoToDto } from './sujeto.mapper';

export function mapAutomotorToDto(automotor: Automotor & { sujeto: Sujeto }) {
  return {
    dominio: automotor.dominio,
    chasis: automotor.chasis,
    motor: automotor.motor,
    color: automotor.color,
    fechaFabricacion: automotor.fechaFabricacion,
    sujeto: mapSujetoToDto(automotor.sujeto),
  };
}

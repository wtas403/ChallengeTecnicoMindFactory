import { Automotor } from '../../domain/models/automotor';
import { AutomotorDraft } from '../../domain/models/automotor-draft';
import { mapSujetoDtoToTitular } from './titular.mapper';
import { AutomotorDto } from '../dtos/automotor.dto';
import { CreateAutomotorDto } from '../dtos/create-automotor.dto';
import { UpdateAutomotorDto } from '../dtos/update-automotor.dto';
import { AutomotorMutationDraft } from '../repositories/automotores-repository';

export function mapAutomotorDtoToAutomotor(automotorDto: AutomotorDto): Automotor {
  return {
    dominio: automotorDto.dominio,
    chasis: automotorDto.chasis,
    motor: automotorDto.motor,
    color: automotorDto.color,
    fechaFabricacion: automotorDto.fechaFabricacion,
    titular: mapSujetoDtoToTitular(automotorDto.sujeto),
  };
}

export function mapAutomotorToDraft(automotor: Automotor): AutomotorDraft {
  return {
    dominio: automotor.dominio,
    chasis: automotor.chasis,
    motor: automotor.motor,
    color: automotor.color,
    fechaFabricacion: automotor.fechaFabricacion,
    cuitTitular: automotor.titular.cuit,
  };
}

export function mapAutomotorDraftToCreateAutomotorDto(
  automotorDraft: AutomotorMutationDraft,
): CreateAutomotorDto {
  return {
    dominio: automotorDraft.dominio,
    chasis: automotorDraft.chasis,
    motor: automotorDraft.motor,
    color: automotorDraft.color,
    fechaFabricacion: automotorDraft.fechaFabricacion,
    cuitTitular: automotorDraft.cuitTitular,
    ...(automotorDraft.nombreTitular ? { nombreTitular: automotorDraft.nombreTitular } : {}),
  };
}

export function mapAutomotorDraftToUpdateAutomotorDto(
  automotorDraft: AutomotorMutationDraft,
): UpdateAutomotorDto {
  return {
    chasis: automotorDraft.chasis,
    motor: automotorDraft.motor,
    color: automotorDraft.color,
    fechaFabricacion: automotorDraft.fechaFabricacion,
    cuitTitular: automotorDraft.cuitTitular,
    ...(automotorDraft.nombreTitular ? { nombreTitular: automotorDraft.nombreTitular } : {}),
  };
}

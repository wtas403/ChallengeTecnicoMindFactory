import { Titular } from '../../domain/models/titular';
import { CreateSujetoDto } from '../dtos/create-sujeto.dto';
import { SujetoDto } from '../dtos/sujeto.dto';

export function mapSujetoDtoToTitular(sujetoDto: SujetoDto): Titular {
  return {
    cuit: sujetoDto.cuit,
    nombreCompleto: sujetoDto.nombreCompleto,
  };
}

export function mapTitularToCreateSujetoDto(titular: Titular): CreateSujetoDto {
  return {
    cuit: titular.cuit,
    nombreCompleto: titular.nombreCompleto,
  };
}

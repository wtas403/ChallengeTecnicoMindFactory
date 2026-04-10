import { SujetoDto } from './sujeto.dto';

export interface AutomotorDto {
  readonly dominio: string;
  readonly chasis: string;
  readonly motor: string;
  readonly color: string;
  readonly fechaFabricacion: string;
  readonly sujeto: SujetoDto;
}

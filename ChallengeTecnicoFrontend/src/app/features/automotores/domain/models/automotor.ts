import { Titular } from './titular';

export interface Automotor {
  readonly dominio: string;
  readonly chasis: string;
  readonly motor: string;
  readonly color: string;
  readonly fechaFabricacion: string;
  readonly titular: Titular;
}

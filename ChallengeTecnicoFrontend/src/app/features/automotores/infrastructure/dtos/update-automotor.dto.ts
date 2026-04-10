export interface UpdateAutomotorDto {
  readonly chasis: string;
  readonly motor: string;
  readonly color: string;
  readonly fechaFabricacion: string;
  readonly cuitTitular: string;
  readonly nombreTitular?: string;
}

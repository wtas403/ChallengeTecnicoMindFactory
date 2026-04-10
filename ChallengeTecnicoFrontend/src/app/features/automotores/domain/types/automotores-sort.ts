export type SortDirection = 'asc' | 'desc';

export type AutomotoresSortField = 'dominio' | 'titular' | 'cuit' | 'fechaFabricacion';

export interface AutomotoresSort {
  readonly field: AutomotoresSortField;
  readonly direction: SortDirection;
}

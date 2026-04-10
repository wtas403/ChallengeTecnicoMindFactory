import { InjectionToken } from '@angular/core';
import { Automotor } from '../../domain/models/automotor';
import { AutomotorDraft } from '../../domain/models/automotor-draft';

export interface AutomotorMutationDraft extends AutomotorDraft {
  readonly nombreTitular?: string;
}

export interface AutomotoresRepository {
  list(): Promise<readonly Automotor[]>;
  getByDominio(dominio: string): Promise<Automotor>;
  create(automotorDraft: AutomotorMutationDraft): Promise<Automotor>;
  update(dominio: string, automotorDraft: AutomotorMutationDraft): Promise<Automotor>;
  delete(dominio: string): Promise<void>;
}

export const AUTOMOTORES_REPOSITORY = new InjectionToken<AutomotoresRepository>(
  'AUTOMOTORES_REPOSITORY',
);

import { InjectionToken } from '@angular/core';
import { Titular } from '../../domain/models/titular';

export interface TitularesRepository {
  getByCuit(cuit: string): Promise<Titular | null>;
  create(titular: Titular): Promise<Titular>;
}

export const TITULARES_REPOSITORY = new InjectionToken<TitularesRepository>('TITULARES_REPOSITORY');

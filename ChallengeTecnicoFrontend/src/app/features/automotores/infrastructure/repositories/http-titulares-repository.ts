import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiError, isApiError } from '../../../../core/http/api-error';
import { Titular } from '../../domain/models/titular';
import { SujetosApiService } from '../api/sujetos-api.service';
import { mapSujetoDtoToTitular, mapTitularToCreateSujetoDto } from '../mappers/titular.mapper';
import { TitularesRepository } from './titulares-repository';

@Injectable({ providedIn: 'root' })
export class HttpTitularesRepository implements TitularesRepository {
  private readonly sujetosApiService = inject(SujetosApiService);

  async getByCuit(cuit: string): Promise<Titular | null> {
    try {
      const response = await firstValueFrom(this.sujetosApiService.getByCuit(cuit));
      return mapSujetoDtoToTitular(response);
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        return null;
      }

      throw this.ensureApiError(error);
    }
  }

  async create(titular: Titular): Promise<Titular> {
    const createSujetoDto = mapTitularToCreateSujetoDto(titular);
    const response = await firstValueFrom(this.sujetosApiService.create(createSujetoDto));
    return mapSujetoDtoToTitular(response);
  }

  private ensureApiError(error: unknown): ApiError {
    if (isApiError(error)) {
      return error;
    }

    return new ApiError(0, 'Error inesperado al consultar titulares.');
  }
}

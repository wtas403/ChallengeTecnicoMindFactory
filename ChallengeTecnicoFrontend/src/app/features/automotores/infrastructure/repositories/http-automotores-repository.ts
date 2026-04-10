import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Automotor } from '../../domain/models/automotor';
import { AutomotoresApiService } from '../api/automotores-api.service';
import {
  mapAutomotorDtoToAutomotor,
  mapAutomotorDraftToCreateAutomotorDto,
  mapAutomotorDraftToUpdateAutomotorDto,
} from '../mappers/automotor.mapper';
import { AutomotorMutationDraft, AutomotoresRepository } from './automotores-repository';

@Injectable({ providedIn: 'root' })
export class HttpAutomotoresRepository implements AutomotoresRepository {
  private readonly automotoresApiService = inject(AutomotoresApiService);

  async list(): Promise<readonly Automotor[]> {
    const response = await firstValueFrom(this.automotoresApiService.list());
    return response.map(mapAutomotorDtoToAutomotor);
  }

  async getByDominio(dominio: string): Promise<Automotor> {
    const response = await firstValueFrom(this.automotoresApiService.getByDominio(dominio));
    return mapAutomotorDtoToAutomotor(response);
  }

  async create(automotorDraft: AutomotorMutationDraft): Promise<Automotor> {
    const createDto = mapAutomotorDraftToCreateAutomotorDto(automotorDraft);
    const response = await firstValueFrom(this.automotoresApiService.create(createDto));
    return mapAutomotorDtoToAutomotor(response);
  }

  async update(dominio: string, automotorDraft: AutomotorMutationDraft): Promise<Automotor> {
    const updateDto = mapAutomotorDraftToUpdateAutomotorDto(automotorDraft);
    const response = await firstValueFrom(this.automotoresApiService.update(dominio, updateDto));
    return mapAutomotorDtoToAutomotor(response);
  }

  async delete(dominio: string): Promise<void> {
    await firstValueFrom(this.automotoresApiService.delete(dominio));
  }
}

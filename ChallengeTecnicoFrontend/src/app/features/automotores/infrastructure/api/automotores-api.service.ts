import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { AutomotorDto } from '../dtos/automotor.dto';
import { CreateAutomotorDto } from '../dtos/create-automotor.dto';
import { UpdateAutomotorDto } from '../dtos/update-automotor.dto';

@Injectable({ providedIn: 'root' })
export class AutomotoresApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly automotoresEndpoint = `${this.apiBaseUrl}/automotores`;

  list(): Observable<readonly AutomotorDto[]> {
    return this.httpClient.get<readonly AutomotorDto[]>(this.automotoresEndpoint);
  }

  getByDominio(dominio: string): Observable<AutomotorDto> {
    return this.httpClient.get<AutomotorDto>(
      `${this.automotoresEndpoint}/${encodeURIComponent(dominio)}`,
    );
  }

  create(createAutomotorDto: CreateAutomotorDto): Observable<AutomotorDto> {
    return this.httpClient.post<AutomotorDto>(this.automotoresEndpoint, createAutomotorDto);
  }

  update(dominio: string, updateAutomotorDto: UpdateAutomotorDto): Observable<AutomotorDto> {
    return this.httpClient.put<AutomotorDto>(
      `${this.automotoresEndpoint}/${encodeURIComponent(dominio)}`,
      updateAutomotorDto,
    );
  }

  delete(dominio: string): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.automotoresEndpoint}/${encodeURIComponent(dominio)}`,
    );
  }
}

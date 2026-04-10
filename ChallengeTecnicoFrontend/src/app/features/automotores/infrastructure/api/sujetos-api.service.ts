import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { CreateSujetoDto } from '../dtos/create-sujeto.dto';
import { SujetoDto } from '../dtos/sujeto.dto';

@Injectable({ providedIn: 'root' })
export class SujetosApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly sujetosEndpoint = `${this.apiBaseUrl}/sujetos`;

  getByCuit(cuit: string): Observable<SujetoDto> {
    return this.httpClient.get<SujetoDto>(`${this.sujetosEndpoint}/by-cuit`, {
      params: {
        cuit,
      },
    });
  }

  create(createSujetoDto: CreateSujetoDto): Observable<SujetoDto> {
    return this.httpClient.post<SujetoDto>(this.sujetosEndpoint, createSujetoDto);
  }
}

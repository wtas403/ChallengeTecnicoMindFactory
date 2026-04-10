import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  LucideIconProvider,
  LUCIDE_ICONS,
  Search,
  TriangleAlert,
} from 'lucide-angular';
import { API_BASE_URL } from './core/config/api.config';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { HttpAutomotoresRepository } from './features/automotores/infrastructure/repositories/http-automotores-repository';
import { AUTOMOTORES_REPOSITORY } from './features/automotores/infrastructure/repositories/automotores-repository';
import { HttpTitularesRepository } from './features/automotores/infrastructure/repositories/http-titulares-repository';
import { TITULARES_REPOSITORY } from './features/automotores/infrastructure/repositories/titulares-repository';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Search, ArrowUp, ArrowDown, ArrowUpDown, TriangleAlert }),
    },
    { provide: API_BASE_URL, useValue: '/api' },
    { provide: AUTOMOTORES_REPOSITORY, useExisting: HttpAutomotoresRepository },
    { provide: TITULARES_REPOSITORY, useExisting: HttpTitularesRepository },
  ],
};

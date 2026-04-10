import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AutomotoresList } from '../components/automotores-list';

@Component({
  selector: 'app-automotores-list-page',
  imports: [AutomotoresList, RouterLink],
  template: `
    <main
      id="automotores-page"
      class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      aria-labelledby="automotores-title"
    >
      <header
        class="editorial-panel mb-5 rounded-[1.5rem] px-5 py-5 motion-safe:animate-[fade-up_0.45s_ease-out] sm:px-6 sm:py-6"
      >
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p class="editorial-kicker mb-2 text-[0.68rem] font-semibold text-slate-500">
              Sistema registral provincial
            </p>
            <h1
              id="automotores-title"
              class="editorial-title m-0 text-2xl font-semibold text-slate-950 sm:text-3xl"
            >
              Gestion de automotores
            </h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-600">
              Consulta, filtra y administra registros vigentes desde una vista operativa.
            </p>
          </div>

          <div
            class="grid gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 sm:px-5"
          >
            <p class="editorial-kicker text-[0.68rem] font-semibold text-slate-500">
              Accion principal
            </p>
            <p class="m-0 text-sm text-slate-600">
              Registra un nuevo automotor en el padrón operativo.
            </p>
            <a
              id="automotores-create-link"
              class="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              routerLink="/crear"
              >Crear automotor</a
            >
          </div>
        </div>
      </header>

      <app-automotores-list></app-automotores-list>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotoresListPage {}

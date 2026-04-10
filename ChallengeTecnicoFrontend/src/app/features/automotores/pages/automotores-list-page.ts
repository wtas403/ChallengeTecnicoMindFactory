import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AutomotoresList } from '../components/automotores-list';

@Component({
  selector: 'app-automotores-list-page',
  imports: [AutomotoresList, RouterLink],
  template: `
    <main
      id="automotores-page"
      class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      aria-labelledby="automotores-title"
    >
      <header
        class="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-5 py-6 text-white shadow-lg shadow-slate-900/10 motion-safe:animate-[fade-up_0.45s_ease-out] sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
            Gestion de flota
          </p>
          <h1 id="automotores-title" class="m-0 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Automotores
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
            Gestiona el listado de automotores y accede a las acciones principales.
          </p>
        </div>

        <a
          id="automotores-create-link"
          class="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          routerLink="/crear"
          >Crear automotor</a
        >
      </header>

      <app-automotores-list></app-automotores-list>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotoresListPage {}

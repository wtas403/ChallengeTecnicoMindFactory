import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AutomotoresList } from '../components/automotores-list';

@Component({
  selector: 'app-automotores-list-page',
  imports: [AutomotoresList],
  template: `
    <main
      id="automotores-page"
      class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      aria-labelledby="automotores-title"
    >
      <header class="mb-5">
        <div>
          <h1
            id="automotores-title"
            class="editorial-title m-0 text-2xl font-semibold text-slate-950 sm:text-3xl"
          >
            Gestion de automotores
          </h1>
        </div>
      </header>

      <app-automotores-list></app-automotores-list>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotoresListPage {}

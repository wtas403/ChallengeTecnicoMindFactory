import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/automotores/routes/automotores.routes').then((m) => m.AUTOMOTORES_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

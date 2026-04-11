import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'metricas',
    loadComponent: () =>
      import('./features/performance/pages/web-vitals-dashboard-page').then(
        (m) => m.WebVitalsDashboardPage,
      ),
  },
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

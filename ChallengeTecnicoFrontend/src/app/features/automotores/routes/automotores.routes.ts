import { Routes } from '@angular/router';
import { automotorPendingChangesGuard } from './automotor-pending-changes.guard';

export const AUTOMOTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/automotores-list-page').then((m) => m.AutomotoresListPage),
  },
  {
    path: 'crear',
    canDeactivate: [automotorPendingChangesGuard],
    loadComponent: () => import('../pages/automotor-form-page').then((m) => m.AutomotorFormPage),
  },
  {
    path: ':dominio/editar',
    canDeactivate: [automotorPendingChangesGuard],
    loadComponent: () => import('../pages/automotor-form-page').then((m) => m.AutomotorFormPage),
  },
];

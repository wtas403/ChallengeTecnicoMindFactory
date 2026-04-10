import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesAware {
  hasUnsavedChanges(): boolean;
}

export const automotorPendingChangesGuard: CanDeactivateFn<PendingChangesAware> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return globalThis.confirm(
    'Hay cambios sin guardar. Si abandonas esta pantalla, se perderan los cambios.',
  );
};

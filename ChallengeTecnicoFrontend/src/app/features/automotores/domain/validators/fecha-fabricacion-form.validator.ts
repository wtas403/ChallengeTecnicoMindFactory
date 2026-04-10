import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isFechaFabricacionValid } from './fecha-fabricacion.validator';

export function fechaFabricacionFormValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value;

    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    return isFechaFabricacionValid(value) ? null : { fechaFabricacionInvalida: true };
  };
}

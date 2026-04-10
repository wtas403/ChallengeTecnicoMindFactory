import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isDominioValid } from './dominio.validator';

export function dominioFormValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value;

    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    return isDominioValid(value) ? null : { dominioInvalido: true };
  };
}

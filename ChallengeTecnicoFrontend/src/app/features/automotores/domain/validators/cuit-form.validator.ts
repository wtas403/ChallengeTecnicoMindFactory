import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isCuitValid } from './cuit.validator';

export function cuitFormValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value;

    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    return isCuitValid(value) ? null : { cuitInvalido: true };
  };
}

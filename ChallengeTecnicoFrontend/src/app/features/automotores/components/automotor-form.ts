import {
  ElementRef,
  ChangeDetectionStrategy,
  Component,
  viewChild,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiFieldError } from '../../../core/http/api-error';
import { AutomotorDraft } from '../domain/models/automotor-draft';
import { cuitFormValidator } from '../domain/validators/cuit-form.validator';
import { normalizeCuit } from '../domain/validators/cuit.validator';
import { dominioFormValidator } from '../domain/validators/dominio-form.validator';
import { normalizeDominio } from '../domain/validators/dominio.validator';
import { fechaFabricacionFormValidator } from '../domain/validators/fecha-fabricacion-form.validator';

const EMPTY_DRAFT: AutomotorDraft = {
  dominio: '',
  chasis: '',
  motor: '',
  color: '',
  fechaFabricacion: '',
  cuitTitular: '',
};

@Component({
  selector: 'app-automotor-form',
  imports: [ReactiveFormsModule],
  template: `
    <section
      id="automotor-form-section"
      class="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur motion-safe:animate-[fade-up_0.5s_ease-out] sm:p-6"
      aria-live="polite"
      [attr.aria-busy]="isLoading() || isSubmitting()"
    >
      @if (errorMessage()) {
        <div
          id="automotor-form-global-error"
          class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          role="alert"
        >
          <p class="m-0">{{ errorMessage() }}</p>
        </div>
      }

      <form
        #automotorFormElement
        id="automotor-form"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        novalidate
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="automotor-form-dominio" class="text-sm font-semibold text-slate-700"
              >Dominio</label
            >
            <input
              id="automotor-form-dominio"
              type="text"
              formControlName="dominio"
              maxlength="7"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [attr.aria-invalid]="isFieldInvalid('dominio')"
              [attr.aria-describedby]="fieldDescribedBy('dominio')"
            />
            @if (controlError('dominio')) {
              <p class="m-0 text-xs font-medium text-rose-700" [id]="fieldErrorId('dominio')">
                {{ controlError('dominio') }}
              </p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="automotor-form-chasis" class="text-sm font-semibold text-slate-700"
              >Chasis</label
            >
            <input
              id="automotor-form-chasis"
              type="text"
              formControlName="chasis"
              maxlength="40"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [attr.aria-invalid]="isFieldInvalid('chasis')"
              [attr.aria-describedby]="fieldDescribedBy('chasis')"
            />
            @if (controlError('chasis')) {
              <p class="m-0 text-xs font-medium text-rose-700" [id]="fieldErrorId('chasis')">
                {{ controlError('chasis') }}
              </p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="automotor-form-motor" class="text-sm font-semibold text-slate-700"
              >Motor</label
            >
            <input
              id="automotor-form-motor"
              type="text"
              formControlName="motor"
              maxlength="40"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [attr.aria-invalid]="isFieldInvalid('motor')"
              [attr.aria-describedby]="fieldDescribedBy('motor')"
            />
            @if (controlError('motor')) {
              <p class="m-0 text-xs font-medium text-rose-700" [id]="fieldErrorId('motor')">
                {{ controlError('motor') }}
              </p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="automotor-form-color" class="text-sm font-semibold text-slate-700"
              >Color</label
            >
            <input
              id="automotor-form-color"
              type="text"
              formControlName="color"
              maxlength="40"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [attr.aria-invalid]="isFieldInvalid('color')"
              [attr.aria-describedby]="fieldDescribedBy('color')"
            />
            @if (controlError('color')) {
              <p class="m-0 text-xs font-medium text-rose-700" [id]="fieldErrorId('color')">
                {{ controlError('color') }}
              </p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="automotor-form-fecha-fabricacion"
              class="text-sm font-semibold text-slate-700"
              >Fecha fabricacion (YYYYMM)</label
            >
            <input
              id="automotor-form-fecha-fabricacion"
              type="text"
              formControlName="fechaFabricacion"
              maxlength="6"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [attr.aria-invalid]="isFieldInvalid('fechaFabricacion')"
              [attr.aria-describedby]="fieldDescribedBy('fechaFabricacion')"
            />
            @if (controlError('fechaFabricacion')) {
              <p
                class="m-0 text-xs font-medium text-rose-700"
                [id]="fieldErrorId('fechaFabricacion')"
              >
                {{ controlError('fechaFabricacion') }}
              </p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="automotor-form-cuit-titular" class="text-sm font-semibold text-slate-700"
              >CUIT titular</label
            >
            <input
              id="automotor-form-cuit-titular"
              type="text"
              formControlName="cuitTitular"
              maxlength="13"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              [attr.aria-invalid]="isFieldInvalid('cuitTitular')"
              [attr.aria-describedby]="fieldDescribedBy('cuitTitular')"
            />
            @if (controlError('cuitTitular')) {
              <p class="m-0 text-xs font-medium text-rose-700" [id]="fieldErrorId('cuitTitular')">
                {{ controlError('cuitTitular') }}
              </p>
            }
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-2.5 border-t border-slate-200 pt-4">
          @if (!hidePrimarySubmit()) {
            <button
              id="automotor-form-submit"
              type="submit"
              class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="isLoading() || isSubmitting() || isDeleting()"
            >
              {{ isEditMode() ? 'Guardar cambios' : 'Crear automotor' }}
            </button>
          } @else {
            <p class="my-1 text-sm font-medium text-slate-600">
              Completa el bloque de titular para continuar con el guardado.
            </p>
          }
          <button
            id="automotor-form-cancel"
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            (click)="cancel.emit()"
            [disabled]="isSubmitting() || isDeleting()"
          >
            Cancelar
          </button>
          @if (isEditMode()) {
            <button
              id="automotor-form-delete"
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              (click)="delete.emit()"
              [disabled]="isSubmitting() || isDeleting()"
            >
              {{ isDeleting() ? 'Eliminando...' : 'Eliminar automotor' }}
            </button>
          }
        </div>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotorForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formElement = viewChild<ElementRef<HTMLFormElement>>('automotorFormElement');

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialDraft = input<AutomotorDraft | null>(null);
  readonly isLoading = input(false);
  readonly isSubmitting = input(false);
  readonly isDeleting = input(false);
  readonly hidePrimarySubmit = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly fieldErrors = input<readonly ApiFieldError[]>([]);

  readonly save = output<AutomotorDraft>();
  readonly cancel = output<void>();
  readonly delete = output<void>();
  readonly dirtyChange = output<boolean>();
  readonly cuitTitularChange = output<string>();
  readonly draftChange = output<AutomotorDraft>();

  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly form = this.formBuilder.nonNullable.group({
    dominio: ['', [Validators.required, dominioFormValidator()]],
    chasis: ['', [Validators.required]],
    motor: ['', [Validators.required]],
    color: ['', [Validators.required]],
    fechaFabricacion: ['', [Validators.required, fechaFabricacionFormValidator()]],
    cuitTitular: ['', [Validators.required, cuitFormValidator()]],
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.dirtyChange.emit(this.form.dirty);
      this.cuitTitularChange.emit(normalizeCuit(this.form.getRawValue().cuitTitular));
      this.draftChange.emit(this.buildDraftSnapshot());
    });

    effect(() => {
      const initialDraft = this.initialDraft() ?? EMPTY_DRAFT;

      this.form.reset(initialDraft, { emitEvent: false });
      this.form.markAsPristine();
      this.dirtyChange.emit(false);
      this.cuitTitularChange.emit(normalizeCuit(initialDraft.cuitTitular));
      this.draftChange.emit(this.buildDraftSnapshot());

      if (this.mode() === 'edit') {
        this.form.controls.dominio.disable({ emitEvent: false });
      } else {
        this.form.controls.dominio.enable({ emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.focusFirstInvalidField();
      return;
    }

    const rawValue = this.form.getRawValue();

    this.save.emit({
      dominio: normalizeDominio(rawValue.dominio),
      chasis: rawValue.chasis.trim(),
      motor: rawValue.motor.trim(),
      color: rawValue.color.trim(),
      fechaFabricacion: rawValue.fechaFabricacion.trim(),
      cuitTitular: normalizeCuit(rawValue.cuitTitular),
    });
  }

  isFieldInvalid(fieldName: keyof AutomotorDraft): 'true' | 'false' {
    const control = this.form.controls[fieldName];
    const hasError = Boolean(this.controlError(fieldName));
    return control.touched || this.hasServerFieldError(fieldName)
      ? hasError
        ? 'true'
        : 'false'
      : 'false';
  }

  fieldDescribedBy(fieldName: keyof AutomotorDraft): string | null {
    return this.controlError(fieldName) ? this.fieldErrorId(fieldName) : null;
  }

  fieldErrorId(fieldName: keyof AutomotorDraft): string {
    return `automotor-form-${fieldName}-error`;
  }

  controlError(fieldName: keyof AutomotorDraft): string | null {
    const control = this.form.controls[fieldName];

    if (!control.touched && !this.hasServerFieldError(fieldName)) {
      return null;
    }

    const serverError = this.getServerFieldError(fieldName);

    if (serverError) {
      return serverError;
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['dominioInvalido']) {
      return 'El dominio debe tener formato AAA999 o AA999AA.';
    }

    if (control.errors?.['cuitInvalido']) {
      return 'El CUIT ingresado no es valido.';
    }

    if (control.errors?.['fechaFabricacionInvalida']) {
      return 'La fecha debe tener formato YYYYMM, mes valido y no ser futura.';
    }

    return null;
  }

  private hasServerFieldError(fieldName: keyof AutomotorDraft): boolean {
    return this.fieldErrors().some((error) => error.field === fieldName);
  }

  private getServerFieldError(fieldName: keyof AutomotorDraft): string | null {
    const fieldError = this.fieldErrors().find((error) => error.field === fieldName);
    return fieldError?.message ?? null;
  }

  private buildDraftSnapshot(): AutomotorDraft {
    const rawValue = this.form.getRawValue();

    return {
      dominio: normalizeDominio(rawValue.dominio),
      chasis: rawValue.chasis.trim(),
      motor: rawValue.motor.trim(),
      color: rawValue.color.trim(),
      fechaFabricacion: rawValue.fechaFabricacion.trim(),
      cuitTitular: normalizeCuit(rawValue.cuitTitular),
    };
  }

  private focusFirstInvalidField(): void {
    const formElement = this.formElement()?.nativeElement;

    if (!formElement) {
      return;
    }

    const fieldOrder: readonly (keyof AutomotorDraft)[] = [
      'dominio',
      'chasis',
      'motor',
      'color',
      'fechaFabricacion',
      'cuitTitular',
    ];

    const firstInvalidField = fieldOrder.find((fieldName) => this.form.controls[fieldName].invalid);

    if (!firstInvalidField) {
      return;
    }

    const inputElement = formElement.querySelector<HTMLInputElement>(
      `#automotor-form-${firstInvalidField === 'fechaFabricacion' ? 'fecha-fabricacion' : firstInvalidField === 'cuitTitular' ? 'cuit-titular' : firstInvalidField}`,
    );

    inputElement?.focus();
  }
}

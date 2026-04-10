import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
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
      class="editorial-panel rounded-[1.5rem] p-4 motion-safe:animate-[fade-up_0.5s_ease-out] sm:p-5"
      aria-live="polite"
      [attr.aria-busy]="isLoading() || isSubmitting()"
    >
      <header class="mb-4 border-b border-slate-200 pb-4">
        <div>
          <p class="editorial-kicker m-0 text-[0.68rem] font-semibold text-slate-500">
            Sistema registral interno
          </p>
          <h2 class="editorial-title mt-2 text-2xl font-semibold text-slate-950">
            {{ isEditMode() ? 'Ficha de actualizacion registral' : 'Alta de automotor' }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm text-slate-600">
            Completa los datos registrales del automotor y del titular responsable.
          </p>
        </div>
      </header>

      @if (errorMessage()) {
        <div
          id="automotor-form-global-error"
          class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
          role="alert"
        >
          <p class="m-0">{{ errorMessage() }}</p>
        </div>
      }

      <form
        #automotorFormElement
        id="automotor-form"
        class="grid gap-5"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        novalidate
      >
        <section class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div
            class="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3"
          >
            <div>
              <p class="editorial-kicker m-0 text-[0.68rem] font-semibold text-slate-500">
                Seccion I
              </p>
              <h3 class="editorial-title mt-1 text-lg font-semibold text-slate-950">
                Datos del automotor
              </h3>
            </div>
            <p class="m-0 max-w-sm text-sm text-slate-600">
              Identificacion y datos tecnicos del registro.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="automotor-form-dominio" class="text-sm font-semibold text-slate-800"
                >Dominio</label
              >
              <p class="m-0 text-xs text-slate-500">Formato: AAA999 o AA999AA.</p>
              <input
                id="automotor-form-dominio"
                type="text"
                formControlName="dominio"
                maxlength="7"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
                [attr.aria-invalid]="isFieldInvalid('dominio')"
                [attr.aria-describedby]="fieldDescribedBy('dominio')"
              />
              @if (controlError('dominio')) {
                <p class="m-0 text-xs font-medium text-rose-800" [id]="fieldErrorId('dominio')">
                  {{ controlError('dominio') }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label
                for="automotor-form-fecha-fabricacion"
                class="text-sm font-semibold text-slate-800"
              >
                Fecha fabricacion (YYYYMM)
              </label>
              <p class="m-0 text-xs text-slate-500">Mes y anio de fabricacion.</p>
              <input
                id="automotor-form-fecha-fabricacion"
                type="text"
                formControlName="fechaFabricacion"
                maxlength="6"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
                [attr.aria-invalid]="isFieldInvalid('fechaFabricacion')"
                [attr.aria-describedby]="fieldDescribedBy('fechaFabricacion')"
              />
              @if (controlError('fechaFabricacion')) {
                <p
                  class="m-0 text-xs font-medium text-rose-800"
                  [id]="fieldErrorId('fechaFabricacion')"
                >
                  {{ controlError('fechaFabricacion') }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="automotor-form-chasis" class="text-sm font-semibold text-slate-800"
                >Chasis</label
              >
              <input
                id="automotor-form-chasis"
                type="text"
                formControlName="chasis"
                maxlength="40"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
                [attr.aria-invalid]="isFieldInvalid('chasis')"
                [attr.aria-describedby]="fieldDescribedBy('chasis')"
              />
              @if (controlError('chasis')) {
                <p class="m-0 text-xs font-medium text-rose-800" [id]="fieldErrorId('chasis')">
                  {{ controlError('chasis') }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="automotor-form-motor" class="text-sm font-semibold text-slate-800"
                >Motor</label
              >
              <input
                id="automotor-form-motor"
                type="text"
                formControlName="motor"
                maxlength="40"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
                [attr.aria-invalid]="isFieldInvalid('motor')"
                [attr.aria-describedby]="fieldDescribedBy('motor')"
              />
              @if (controlError('motor')) {
                <p class="m-0 text-xs font-medium text-rose-800" [id]="fieldErrorId('motor')">
                  {{ controlError('motor') }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="automotor-form-color" class="text-sm font-semibold text-slate-800"
                >Color</label
              >
              <input
                id="automotor-form-color"
                type="text"
                formControlName="color"
                maxlength="40"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
                [attr.aria-invalid]="isFieldInvalid('color')"
                [attr.aria-describedby]="fieldDescribedBy('color')"
              />
              @if (controlError('color')) {
                <p class="m-0 text-xs font-medium text-rose-800" [id]="fieldErrorId('color')">
                  {{ controlError('color') }}
                </p>
              }
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div
            class="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3"
          >
            <div>
              <p class="editorial-kicker m-0 text-[0.68rem] font-semibold text-slate-500">
                Seccion II
              </p>
              <h3 class="editorial-title mt-1 text-lg font-semibold text-slate-950">
                Titular responsable
              </h3>
            </div>
            <p class="m-0 max-w-sm text-sm text-slate-600">
              Datos del sujeto asociado al automotor.
            </p>
          </div>

          <div class="grid gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="automotor-form-cuit-titular" class="text-sm font-semibold text-slate-800">
                CUIT titular
              </label>
              <p class="m-0 text-xs text-slate-500">Se validara antes de guardar.</p>
              <input
                id="automotor-form-cuit-titular"
                type="text"
                formControlName="cuitTitular"
                maxlength="13"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
                [attr.aria-invalid]="isFieldInvalid('cuitTitular')"
                [attr.aria-describedby]="fieldDescribedBy('cuitTitular')"
              />
              @if (controlError('cuitTitular')) {
                <p class="m-0 text-xs font-medium text-rose-800" [id]="fieldErrorId('cuitTitular')">
                  {{ controlError('cuitTitular') }}
                </p>
              }
            </div>
          </div>
        </section>

        @if (!hidePrimarySubmit()) {
          <div class="flex flex-wrap gap-2.5 border-t border-slate-200 pt-1">
            <button
              id="automotor-form-submit"
              type="submit"
              class="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="isLoading() || isSubmitting() || isDeleting()"
            >
              {{ isEditMode() ? 'Guardar cambios' : 'Crear automotor' }}
            </button>
            <button
              id="automotor-form-cancel"
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              (click)="cancel.emit()"
              [disabled]="isSubmitting() || isDeleting()"
            >
              Cancelar
            </button>
            @if (isEditMode()) {
              <button
                id="automotor-form-delete"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                (click)="delete.emit()"
                [disabled]="isSubmitting() || isDeleting()"
              >
                {{ isDeleting() ? 'Eliminando...' : 'Eliminar automotor' }}
              </button>
            }
          </div>
        }
      </form>

      @if (isConfirmDialogOpen()) {
        <div
          id="automotor-create-confirmation-backdrop"
          class="fixed inset-0 z-40 bg-slate-950/35"
          (click)="closeConfirmDialog()"
        ></div>

        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          (keydown.escape)="closeConfirmDialog()"
        >
          <section
            id="automotor-create-confirmation-dialog"
            class="editorial-panel w-full max-w-xl rounded-xl p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="automotor-confirmation-title"
            aria-describedby="automotor-confirmation-description"
          >
            <div
              class="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3"
            >
              <div>
                <p class="editorial-kicker m-0 text-[0.68rem] font-semibold text-slate-500">
                  Confirmacion
                </p>
                <h3
                  id="automotor-confirmation-title"
                  class="editorial-title mt-1 text-lg font-semibold text-slate-950"
                >
                  Confirmar alta de automotor
                </h3>
              </div>
              <span
                class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Alta
              </span>
            </div>

            <p id="automotor-confirmation-description" class="m-0 text-sm text-slate-600">
              Revisa los datos antes de confirmar. Esta operacion registrara el automotor en el
              sistema.
            </p>

            <dl class="mt-5 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Dominio
                </dt>
                <dd class="m-0 mt-1 text-sm font-semibold text-slate-950">
                  {{ confirmationDraft()?.dominio }}
                </dd>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  CUIT titular
                </dt>
                <dd class="m-0 mt-1 text-sm font-semibold text-slate-950">
                  {{ confirmationDraft()?.cuitTitular }}
                </dd>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Fabricacion
                </dt>
                <dd class="m-0 mt-1 text-sm font-semibold text-slate-950">
                  {{ confirmationDraft()?.fechaFabricacion }}
                </dd>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Color
                </dt>
                <dd class="m-0 mt-1 text-sm font-semibold text-slate-950">
                  {{ confirmationDraft()?.color }}
                </dd>
              </div>
            </dl>

            <div class="mt-5 flex flex-wrap gap-2.5 border-t border-slate-200 pt-4">
              <button
                #confirmCreateButton
                id="automotor-confirmation-confirm"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                (click)="confirmCreate()"
              >
                Confirmar alta
              </button>
              <button
                id="automotor-confirmation-cancel"
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                (click)="closeConfirmDialog()"
              >
                Volver a editar
              </button>
            </div>
          </section>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotorForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formElement = viewChild<ElementRef<HTMLFormElement>>('automotorFormElement');
  private readonly confirmCreateButton =
    viewChild<ElementRef<HTMLButtonElement>>('confirmCreateButton');
  private lastSubmitTrigger: HTMLElement | null = null;

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
  readonly isConfirmDialogOpen = signal(false);
  readonly confirmationDraft = signal<AutomotorDraft | null>(null);

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

    effect(() => {
      if (!this.isConfirmDialogOpen()) {
        return;
      }

      queueMicrotask(() => {
        this.confirmCreateButton()?.nativeElement.focus();
      });
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.focusFirstInvalidField();
      return;
    }

    const draft = this.buildDraftSnapshot();

    if (!this.isEditMode()) {
      this.lastSubmitTrigger =
        globalThis.document?.activeElement instanceof HTMLElement
          ? globalThis.document.activeElement
          : null;
      this.confirmationDraft.set(draft);
      this.isConfirmDialogOpen.set(true);
      return;
    }

    this.save.emit(draft);
  }

  confirmCreate(): void {
    const draft = this.confirmationDraft();

    if (!draft) {
      return;
    }

    this.isConfirmDialogOpen.set(false);
    this.save.emit(draft);
    this.confirmationDraft.set(null);
  }

  closeConfirmDialog(): void {
    this.isConfirmDialogOpen.set(false);
    this.confirmationDraft.set(null);

    queueMicrotask(() => {
      this.lastSubmitTrigger?.focus();
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

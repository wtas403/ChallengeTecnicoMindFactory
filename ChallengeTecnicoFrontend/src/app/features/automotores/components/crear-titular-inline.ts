import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-crear-titular-inline',
  imports: [ReactiveFormsModule],
  template: `
    <section
      id="titular-inline-section"
      class="mt-5 rounded-2xl border border-cyan-200/80 bg-cyan-50/70 p-4 shadow-sm ring-1 ring-cyan-100 motion-safe:animate-[fade-in_0.4s_ease-out] sm:p-5"
      aria-labelledby="crear-titular-title"
      aria-live="polite"
    >
      <h2 id="crear-titular-title" class="m-0 text-lg font-bold text-slate-900">
        Crear sujeto para continuar
      </h2>
      <p class="mt-2 text-sm text-slate-700">
        El CUIT {{ cuit() }} no existe. Completa el nombre para crear el titular y guardar el
        automotor en un solo paso.
      </p>

      @if (errorMessage()) {
        <p
          id="titular-inline-error"
          class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800"
          role="alert"
        >
          {{ errorMessage() }}
        </p>
      }

      <form
        id="titular-inline-form"
        class="mt-4"
        [formGroup]="form"
        (ngSubmit)="onCreate()"
        novalidate
      >
        <label
          for="titular-inline-nombre-completo"
          class="mb-1 block text-sm font-semibold text-slate-700"
          >Nombre completo</label
        >
        <input
          #nombreCompletoInput
          id="titular-inline-nombre-completo"
          type="text"
          formControlName="nombreCompleto"
          maxlength="120"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
          [attr.aria-invalid]="isNombreCompletoInvalid()"
          [attr.aria-describedby]="nombreCompletoDescribedBy()"
        />
        @if (
          form.controls.nombreCompleto.touched && form.controls.nombreCompleto.hasError('required')
        ) {
          <p
            id="titular-inline-nombre-completo-error"
            class="mt-2 text-xs font-medium text-rose-700"
          >
            El nombre completo es obligatorio.
          </p>
        }

        <div class="mt-4 flex flex-wrap gap-2.5">
          <button
            id="titular-inline-submit"
            type="submit"
            class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isSubmitting()"
          >
            {{ isSubmitting() ? 'Guardando...' : 'Crear titular y guardar automotor' }}
          </button>
          <button
            id="titular-inline-cancel"
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            (click)="cancel.emit()"
            [disabled]="isSubmitting()"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearTitularInline implements AfterViewInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly nombreCompletoInput =
    viewChild<ElementRef<HTMLInputElement>>('nombreCompletoInput');

  readonly cuit = input.required<string>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly create = output<string>();
  readonly cancel = output<void>();

  readonly form = this.formBuilder.nonNullable.group({
    nombreCompleto: ['', [Validators.required]],
  });

  ngAfterViewInit(): void {
    this.nombreCompletoInput()?.nativeElement.focus();
  }

  onCreate(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.create.emit(this.form.controls.nombreCompleto.getRawValue().trim());
  }

  isNombreCompletoInvalid(): 'true' | 'false' {
    const control = this.form.controls.nombreCompleto;
    return control.touched && control.invalid ? 'true' : 'false';
  }

  nombreCompletoDescribedBy(): string | null {
    const control = this.form.controls.nombreCompleto;
    return control.touched && control.hasError('required')
      ? 'titular-inline-nombre-completo-error'
      : null;
  }
}

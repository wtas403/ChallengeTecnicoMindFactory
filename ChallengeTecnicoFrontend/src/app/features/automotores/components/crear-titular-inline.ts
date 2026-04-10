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
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-crear-titular-inline',
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <section
      id="titular-inline-section"
      class="editorial-panel mt-5 rounded-xl p-4 motion-safe:animate-[fade-in_0.4s_ease-out] sm:p-5"
      aria-labelledby="crear-titular-title"
      aria-live="polite"
    >
      <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700"
          >
            <lucide-angular name="triangle-alert" class="size-4"></lucide-angular>
          </div>
          <div class="min-w-0 flex-1">
            <div
              class="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200 pb-3"
            >
              <div>
                <p class="editorial-kicker m-0 text-[0.68rem] font-semibold text-amber-700">
                  Accion requerida para continuar
                </p>
                <h2
                  id="crear-titular-title"
                  class="editorial-title mt-1 text-lg font-semibold text-slate-950"
                >
                  Titular no encontrado
                </h2>
              </div>
              <span
                class="rounded-md border border-amber-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700"
              >
                CUIT {{ cuit() }}
              </span>
            </div>

            <p class="mt-3 text-sm text-slate-700">
              Debes registrar el titular para continuar con el alta del automotor. El CUIT informado
              no existe en el padrón actual.
            </p>
          </div>
        </div>
      </div>

      @if (errorMessage()) {
        <p
          id="titular-inline-error"
          class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-900"
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
          class="mb-1 block text-sm font-semibold text-slate-800"
          >Nombre completo</label
        >
        <input
          #nombreCompletoInput
          id="titular-inline-nombre-completo"
          type="text"
          formControlName="nombreCompleto"
          maxlength="120"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-700 focus-visible:outline-none"
          [attr.aria-invalid]="isNombreCompletoInvalid()"
          [attr.aria-describedby]="nombreCompletoDescribedBy()"
        />
        @if (
          form.controls.nombreCompleto.touched && form.controls.nombreCompleto.hasError('required')
        ) {
          <p
            id="titular-inline-nombre-completo-error"
            class="mt-2 text-xs font-medium text-rose-800"
          >
            El nombre completo es obligatorio.
          </p>
        }

        <div class="mt-4 flex flex-wrap gap-2.5">
          <button
            id="titular-inline-submit"
            type="submit"
            class="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isSubmitting()"
          >
            {{ isSubmitting() ? 'Guardando...' : 'Crear titular y guardar automotor' }}
          </button>
          <button
            id="titular-inline-cancel"
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
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

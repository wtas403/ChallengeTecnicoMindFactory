import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AutomotorForm } from '../components/automotor-form';
import { CrearTitularInline } from '../components/crear-titular-inline';
import { AutomotorFormFacade } from '../application/facades/automotor-form-facade';
import { AutomotorDraft } from '../domain/models/automotor-draft';

@Component({
  selector: 'app-automotor-form-page',
  imports: [RouterLink, AutomotorForm, CrearTitularInline],
  template: `
    <main
      id="automotor-form-page"
      class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      aria-labelledby="automotor-form-title"
    >
      <a
        id="automotor-form-back-link"
        routerLink="/"
        class="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >Volver al listado</a
      >

      <app-automotor-form
        [mode]="mode()"
        [initialDraft]="draft()"
        [isLoading]="isLoading()"
        [isSubmitting]="isSubmitting()"
        [isDeleting]="isDeleting()"
        [hidePrimarySubmit]="showTitularCreation()"
        [errorMessage]="formGlobalErrorMessage()"
        [fieldErrors]="fieldErrors()"
        (save)="onSave($event)"
        (delete)="onDelete()"
        (cancel)="onCancel()"
        (dirtyChange)="onDirtyChange($event)"
        (cuitTitularChange)="onCuitTitularChange($event)"
        (draftChange)="onDraftChange($event)"
      />

      @if (showTitularCreation()) {
        <app-crear-titular-inline
          [cuit]="currentCuitTitular()"
          [isSubmitting]="isCreatingTitular()"
          [errorMessage]="titularCreationErrorMessage()"
          (create)="onCreateTitularAndRetry($event)"
          (cancel)="onCancelTitularCreation()"
        />
      }

      @if (titularLookupMessage()) {
        <p
          id="automotor-form-titular-lookup-success"
          class="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900 motion-safe:animate-[fade-in_0.35s_ease-out]"
          role="status"
        >
          {{ titularLookupMessage() }}
        </p>
      }

      @if (isReasignacionTitular()) {
        <p
          id="automotor-form-reassignment"
          class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 motion-safe:animate-[fade-in_0.35s_ease-out]"
          role="status"
        >
          Estas reasignando el automotor a un nuevo titular responsable.
        </p>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotorFormPage {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly automotorFormFacade = inject(AutomotorFormFacade);
  private readonly shouldIgnorePendingChangesState = signal(false);
  private readonly isDirtyState = signal(false);
  private readonly lastKnownCuitTitularState = signal('');

  private readonly dominioParam = toSignal(
    this.activatedRoute.paramMap.pipe(map((params) => params.get('dominio'))),
    { initialValue: null },
  );

  readonly mode = computed<'create' | 'edit'>(() => (this.dominioParam() ? 'edit' : 'create'));
  readonly draft = computed(() => this.automotorFormFacade.draft());
  readonly isLoading = computed(() => this.automotorFormFacade.isLoading());
  readonly isSubmitting = computed(() => this.automotorFormFacade.isSubmitting());
  readonly isDeleting = computed(() => this.automotorFormFacade.isDeleting());
  readonly isCreatingTitular = computed(() => this.automotorFormFacade.isCreatingTitular());
  readonly showTitularCreation = computed(() =>
    this.automotorFormFacade.isTitularCreationVisible(),
  );
  readonly isReasignacionTitular = computed(() => this.automotorFormFacade.isReasignacionTitular());
  readonly fieldErrors = computed(() => this.automotorFormFacade.fieldErrors());
  readonly errorMessage = computed(() => this.automotorFormFacade.error()?.message ?? null);
  readonly formGlobalErrorMessage = computed(() => {
    const error = this.automotorFormFacade.error();

    if (!error) {
      return null;
    }

    if (this.showTitularCreation() && error.code === 'TITULAR_NOT_FOUND') {
      return null;
    }

    if (error.fieldErrors.length > 0) {
      return null;
    }

    return error.message;
  });
  readonly currentCuitTitular = computed(
    () => this.draft()?.cuitTitular ?? this.lastKnownCuitTitularState(),
  );
  readonly titularCreationErrorMessage = computed(() => {
    if (!this.showTitularCreation()) {
      return null;
    }

    const error = this.automotorFormFacade.error();

    if (!error || error.code === 'TITULAR_NOT_FOUND') {
      return null;
    }

    return error.message;
  });
  readonly titularLookupMessage = computed(() => {
    if (this.showTitularCreation()) {
      return null;
    }

    const status = this.automotorFormFacade.titularLookupStatus();

    if (status === 'success') {
      return `Titular encontrado: ${this.automotorFormFacade.titular()?.nombreCompleto ?? ''}`;
    }

    return null;
  });
  readonly title = computed(() =>
    this.mode() === 'edit' ? `Editar automotor ${this.dominioParam()}` : 'Crear automotor',
  );

  constructor() {
    effect(() => {
      const dominio = this.dominioParam();

      if (dominio) {
        void this.automotorFormFacade.loadForEdit(dominio);
        return;
      }

      this.automotorFormFacade.initializeForCreate();
    });
  }

  async onSave(draft: AutomotorDraft): Promise<void> {
    const dominio = this.dominioParam();

    const isSuccess = dominio
      ? await this.automotorFormFacade.update(dominio, draft)
      : await this.automotorFormFacade.create(draft);

    if (!isSuccess) {
      return;
    }

    this.shouldIgnorePendingChangesState.set(true);
    this.isDirtyState.set(false);
    await this.router.navigate(['/']);
  }

  async onDelete(): Promise<void> {
    const dominio = this.dominioParam();

    if (!dominio) {
      return;
    }

    const shouldDelete = globalThis.confirm(
      `Se eliminara el automotor ${dominio}. Esta accion no se puede deshacer.`,
    );

    if (!shouldDelete) {
      return;
    }

    const isSuccess = await this.automotorFormFacade.delete(dominio);

    if (!isSuccess) {
      return;
    }

    this.shouldIgnorePendingChangesState.set(true);
    this.isDirtyState.set(false);
    await this.router.navigate(['/']);
  }

  async onCancel(): Promise<void> {
    if (this.isDirtyState()) {
      const shouldExit = globalThis.confirm(
        'Tienes cambios sin guardar. Si sales ahora, se perderan.',
      );

      if (!shouldExit) {
        return;
      }
    }

    this.shouldIgnorePendingChangesState.set(true);
    await this.router.navigate(['/']);
  }

  onDirtyChange(isDirty: boolean): void {
    this.isDirtyState.set(isDirty);
  }

  onCuitTitularChange(cuitTitular: string): void {
    this.lastKnownCuitTitularState.set(cuitTitular);
    this.automotorFormFacade.updateCurrentCuitTitular(cuitTitular);
  }

  onDraftChange(draft: AutomotorDraft): void {
    if (!this.showTitularCreation()) {
      return;
    }

    this.automotorFormFacade.updatePendingDraft(draft);
  }

  async onCreateTitularAndRetry(nombreCompleto: string): Promise<void> {
    const isSuccess = await this.automotorFormFacade.createTitularAndRetry(nombreCompleto);

    if (!isSuccess) {
      return;
    }

    this.shouldIgnorePendingChangesState.set(true);
    this.isDirtyState.set(false);
    await this.router.navigate(['/']);
  }

  onCancelTitularCreation(): void {
    this.automotorFormFacade.cancelTitularCreation();
  }

  hasUnsavedChanges(): boolean {
    return this.isDirtyState() && !this.shouldIgnorePendingChangesState();
  }
}

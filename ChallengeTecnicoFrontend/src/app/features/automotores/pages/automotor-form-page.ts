import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ApiError } from '../../../core/http/api-error';
import { NotificationStore } from '../../../core/notifications/notification-store';
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
      class="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-5 lg:py-6"
      aria-labelledby="automotor-form-title"
    >
      <a
        id="automotor-form-back-link"
        routerLink="/"
        class="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >Volver al listado</a
      >

      <header class="mb-5 border-b border-slate-200 pb-4">
        <h1
          id="automotor-form-title"
          class="editorial-title m-0 text-2xl font-semibold text-slate-950"
        >
          {{ title() }}
        </h1>
        <p class="mt-1 text-sm text-slate-600">
          Completa los datos requeridos y verifica la informacion antes de confirmar.
        </p>
      </header>

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

      @if (pendingDeleteDominio()) {
        <div class="fixed inset-0 z-40 bg-slate-950/35" (click)="cancelDelete()"></div>

        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          (keydown.escape)="cancelDelete()"
        >
          <section
            class="editorial-panel w-full max-w-lg rounded-xl p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="automotor-form-delete-title"
            aria-describedby="automotor-form-delete-description"
          >
            <div class="mb-4 grid gap-1 border-b border-slate-200 pb-3">
              <h2
                id="automotor-form-delete-title"
                class="editorial-title m-0 text-lg font-semibold text-slate-950"
              >
                Confirmar eliminacion
              </h2>
            </div>

            <p id="automotor-form-delete-description" class="m-0 text-sm text-slate-600">
              Se eliminara el automotor
              <span class="font-semibold text-slate-950">{{ pendingDeleteDominio() }}</span
              >. Esta accion no se puede deshacer.
            </p>

            <div class="mt-5 flex flex-wrap gap-2.5 border-t border-slate-200 pt-4">
              <button
                #confirmDeleteButton
                id="automotor-form-delete-confirm"
                type="button"
                class="app-button app-button-danger"
                (click)="confirmDelete()"
              >
                Confirmar eliminacion
              </button>
              <button
                id="automotor-form-delete-cancel"
                type="button"
                class="app-button app-button-secondary"
                (click)="cancelDelete()"
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotorFormPage {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly automotorFormFacade = inject(AutomotorFormFacade);
  private readonly notificationStore = inject(NotificationStore);
  private readonly shouldIgnorePendingChangesState = signal(false);
  private readonly isDirtyState = signal(false);
  private readonly lastKnownCuitTitularState = signal('');
  private readonly confirmDeleteButton =
    viewChild<ElementRef<HTMLButtonElement>>('confirmDeleteButton');

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
  readonly pendingDeleteDominio = signal<string | null>(null);

  constructor() {
    effect(() => {
      const dominio = this.dominioParam();

      if (dominio) {
        void this.automotorFormFacade.loadForEdit(dominio);
        return;
      }

      this.automotorFormFacade.initializeForCreate();
    });

    effect(() => {
      if (!this.pendingDeleteDominio()) {
        return;
      }

      queueMicrotask(() => {
        this.confirmDeleteButton()?.nativeElement.focus();
      });
    });
  }

  async onSave(draft: AutomotorDraft): Promise<void> {
    const dominio = this.dominioParam();

    const isSuccess = dominio
      ? await this.automotorFormFacade.update(dominio, draft)
      : await this.automotorFormFacade.create(draft);

    if (!isSuccess) {
      this.notifyFormError(
        dominio
          ? `No se pudo actualizar el automotor ${dominio}.`
          : 'No se pudo crear el automotor.',
      );
      return;
    }

    this.notificationStore.success(
      dominio
        ? `Automotor ${dominio} actualizado correctamente.`
        : `Automotor ${draft.dominio} creado correctamente.`,
    );
    this.shouldIgnorePendingChangesState.set(true);
    this.isDirtyState.set(false);
    await this.router.navigate(['/']);
  }

  onDelete(): void {
    const dominio = this.dominioParam();

    if (!dominio) {
      return;
    }

    this.pendingDeleteDominio.set(dominio);
  }

  cancelDelete(): void {
    this.pendingDeleteDominio.set(null);
  }

  async confirmDelete(): Promise<void> {
    const dominio = this.pendingDeleteDominio();

    if (!dominio) {
      return;
    }

    this.pendingDeleteDominio.set(null);

    const isSuccess = await this.automotorFormFacade.delete(dominio);

    if (!isSuccess) {
      this.notifyFormError(`No se pudo eliminar el automotor ${dominio}.`);
      return;
    }

    this.notificationStore.success(`Automotor ${dominio} eliminado correctamente.`);
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
      this.notifyFormError('No se pudo completar la operacion del automotor.');
      return;
    }

    const dominio = this.automotorFormFacade.draft()?.dominio ?? this.dominioParam();
    this.notificationStore.success(
      this.mode() === 'edit'
        ? `Automotor ${dominio} actualizado correctamente.`
        : `Automotor ${dominio} creado correctamente.`,
    );
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

  private notifyFormError(fallbackMessage: string): void {
    const error = this.automotorFormFacade.error();

    if (error?.fieldErrors.length) {
      this.notificationStore.error(error.fieldErrors[0]?.message ?? fallbackMessage);
      return;
    }

    if (error instanceof ApiError) {
      this.notificationStore.error(error.message);
      return;
    }

    this.notificationStore.error(fallbackMessage);
  }
}

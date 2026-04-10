import { Injectable, computed, signal } from '@angular/core';
import { ApiError } from '../../../../core/http/api-error';
import { AutomotorDraft } from '../../domain/models/automotor-draft';
import { Titular } from '../../domain/models/titular';

export type AutomotorFormMode = 'create' | 'edit';
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
export type TitularLookupStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error';
export type PendingSubmitOperation = 'create' | 'update';

@Injectable({ providedIn: 'root' })
export class AutomotorFormStore {
  private readonly modeState = signal<AutomotorFormMode>('create');
  private readonly loadStatusState = signal<AsyncStatus>('idle');
  private readonly submitStatusState = signal<AsyncStatus>('idle');
  private readonly deleteStatusState = signal<AsyncStatus>('idle');
  private readonly titularCreationStatusState = signal<AsyncStatus>('idle');
  private readonly titularLookupStatusState = signal<TitularLookupStatus>('idle');
  private readonly isTitularCreationVisibleState = signal(false);
  private readonly draftState = signal<AutomotorDraft | null>(null);
  private readonly errorState = signal<ApiError | null>(null);
  private readonly titularState = signal<Titular | null>(null);
  private readonly pendingDraftState = signal<AutomotorDraft | null>(null);
  private readonly pendingOperationState = signal<PendingSubmitOperation | null>(null);
  private readonly pendingDominioState = signal<string | null>(null);
  private readonly originalCuitTitularState = signal<string | null>(null);
  private readonly currentCuitTitularState = signal<string | null>(null);

  readonly mode = computed(() => this.modeState());
  readonly draft = computed(() => this.draftState());
  readonly error = computed(() => this.errorState());
  readonly fieldErrors = computed(() => this.errorState()?.fieldErrors ?? []);
  readonly titular = computed(() => this.titularState());
  readonly loadStatus = computed(() => this.loadStatusState());
  readonly submitStatus = computed(() => this.submitStatusState());
  readonly deleteStatus = computed(() => this.deleteStatusState());
  readonly titularCreationStatus = computed(() => this.titularCreationStatusState());
  readonly titularLookupStatus = computed(() => this.titularLookupStatusState());
  readonly isTitularCreationVisible = computed(() => this.isTitularCreationVisibleState());
  readonly pendingDraft = computed(() => this.pendingDraftState());
  readonly pendingOperation = computed(() => this.pendingOperationState());
  readonly pendingDominio = computed(() => this.pendingDominioState());

  readonly isCreateMode = computed(() => this.modeState() === 'create');
  readonly isEditMode = computed(() => this.modeState() === 'edit');
  readonly isLoading = computed(() => this.loadStatusState() === 'loading');
  readonly isSubmitting = computed(() => this.submitStatusState() === 'loading');
  readonly isDeleting = computed(() => this.deleteStatusState() === 'loading');
  readonly isCreatingTitular = computed(() => this.titularCreationStatusState() === 'loading');
  readonly canDelete = computed(() => this.modeState() === 'edit');
  readonly isReasignacionTitular = computed(() => {
    if (this.modeState() !== 'edit') {
      return false;
    }

    const originalCuit = this.originalCuitTitularState();
    const currentCuit = this.currentCuitTitularState();

    if (!originalCuit || !currentCuit) {
      return false;
    }

    return originalCuit !== currentCuit;
  });

  setCreateMode(): void {
    this.modeState.set('create');
    this.draftState.set(null);
    this.loadStatusState.set('success');
    this.submitStatusState.set('idle');
    this.deleteStatusState.set('idle');
    this.titularCreationStatusState.set('idle');
    this.titularLookupStatusState.set('idle');
    this.isTitularCreationVisibleState.set(false);
    this.titularState.set(null);
    this.originalCuitTitularState.set(null);
    this.currentCuitTitularState.set(null);
    this.clearPendingTitularCreation();
    this.errorState.set(null);
  }

  setEditLoading(): void {
    this.modeState.set('edit');
    this.loadStatusState.set('loading');
    this.errorState.set(null);
  }

  setEditLoaded(draft: AutomotorDraft): void {
    this.modeState.set('edit');
    this.draftState.set(draft);
    this.loadStatusState.set('success');
    this.originalCuitTitularState.set(draft.cuitTitular);
    this.currentCuitTitularState.set(draft.cuitTitular);
    this.errorState.set(null);
  }

  setSubmitLoading(): void {
    this.submitStatusState.set('loading');
    this.errorState.set(null);
  }

  setSubmitSuccess(draft: AutomotorDraft): void {
    this.submitStatusState.set('success');
    this.errorState.set(null);
    this.draftState.set(draft);
    this.currentCuitTitularState.set(draft.cuitTitular);
    this.isTitularCreationVisibleState.set(false);
    this.titularCreationStatusState.set('idle');
    this.clearPendingTitularCreation();
  }

  setDeleteLoading(): void {
    this.deleteStatusState.set('loading');
    this.errorState.set(null);
  }

  setDeleteSuccess(): void {
    this.deleteStatusState.set('success');
    this.errorState.set(null);
  }

  setTitularLookupLoading(): void {
    this.titularLookupStatusState.set('loading');
  }

  setTitularLookupSuccess(titular: Titular): void {
    this.titularLookupStatusState.set('success');
    this.titularState.set(titular);
  }

  setTitularLookupNotFound(): void {
    this.titularLookupStatusState.set('not-found');
    this.titularState.set(null);
  }

  setTitularLookupError(): void {
    this.titularLookupStatusState.set('error');
    this.titularState.set(null);
  }

  setTitularCreationRequired(
    draft: AutomotorDraft,
    operation: PendingSubmitOperation,
    dominio: string | null,
  ): void {
    this.isTitularCreationVisibleState.set(true);
    this.titularCreationStatusState.set('idle');
    this.pendingDraftState.set(draft);
    this.pendingOperationState.set(operation);
    this.pendingDominioState.set(dominio);
  }

  updatePendingDraft(draft: AutomotorDraft): void {
    if (!this.pendingDraftState()) {
      return;
    }

    this.pendingDraftState.set(draft);
  }

  setTitularCreationLoading(): void {
    this.titularCreationStatusState.set('loading');
    this.errorState.set(null);
  }

  setTitularCreationSuccess(): void {
    this.titularCreationStatusState.set('success');
    this.isTitularCreationVisibleState.set(false);
  }

  setTitularCreationError(): void {
    this.titularCreationStatusState.set('error');
  }

  cancelTitularCreation(): void {
    this.titularCreationStatusState.set('idle');
    this.isTitularCreationVisibleState.set(false);
    this.clearPendingTitularCreation();
    this.errorState.set(null);
  }

  clearPendingTitularCreation(): void {
    this.pendingDraftState.set(null);
    this.pendingOperationState.set(null);
    this.pendingDominioState.set(null);
  }

  updateCurrentCuitTitular(cuitTitular: string): void {
    this.currentCuitTitularState.set(cuitTitular);
  }

  setError(error: ApiError): void {
    this.errorState.set(error);

    if (this.submitStatusState() === 'loading') {
      this.submitStatusState.set('error');
    }

    if (this.loadStatusState() === 'loading') {
      this.loadStatusState.set('error');
    }

    if (this.deleteStatusState() === 'loading') {
      this.deleteStatusState.set('error');
    }
  }

  clearError(): void {
    this.errorState.set(null);
  }
}

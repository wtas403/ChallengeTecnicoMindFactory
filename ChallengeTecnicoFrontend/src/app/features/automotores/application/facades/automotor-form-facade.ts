import { Injectable, computed, inject } from '@angular/core';
import { ApiError, isApiError } from '../../../../core/http/api-error';
import { AutomotorDraft } from '../../domain/models/automotor-draft';
import {
  AUTOMOTORES_REPOSITORY,
  AutomotorMutationDraft,
  AutomotoresRepository,
} from '../../infrastructure/repositories/automotores-repository';
import { mapAutomotorToDraft } from '../../infrastructure/mappers/automotor.mapper';
import { AutomotorFormStore } from '../stores/automotor-form-store';

@Injectable({ providedIn: 'root' })
export class AutomotorFormFacade {
  private readonly automotoresRepository = inject<AutomotoresRepository>(AUTOMOTORES_REPOSITORY);
  private readonly formStore = inject(AutomotorFormStore);

  readonly mode = computed(() => this.formStore.mode());
  readonly draft = computed(() => this.formStore.draft());
  readonly error = computed(() => this.formStore.error());
  readonly fieldErrors = computed(() => this.formStore.fieldErrors());
  readonly titular = computed(() => this.formStore.titular());
  readonly isLoading = computed(() => this.formStore.isLoading());
  readonly isSubmitting = computed(() => this.formStore.isSubmitting());
  readonly isDeleting = computed(() => this.formStore.isDeleting());
  readonly isCreatingTitular = computed(() => this.formStore.isCreatingTitular());
  readonly canDelete = computed(() => this.formStore.canDelete());
  readonly titularLookupStatus = computed(() => this.formStore.titularLookupStatus());
  readonly isTitularCreationVisible = computed(() => this.formStore.isTitularCreationVisible());
  readonly isReasignacionTitular = computed(() => this.formStore.isReasignacionTitular());

  initializeForCreate(): void {
    this.formStore.setCreateMode();
  }

  async loadForEdit(dominio: string): Promise<void> {
    this.formStore.setEditLoading();

    try {
      const automotor = await this.automotoresRepository.getByDominio(dominio);
      const draft = mapAutomotorToDraft(automotor);
      this.formStore.setEditLoaded(draft);
    } catch (error) {
      this.formStore.setError(this.ensureApiError(error));
    }
  }

  async create(draft: AutomotorDraft): Promise<boolean> {
    this.formStore.setSubmitLoading();

    try {
      await this.automotoresRepository.create(draft);
      this.formStore.setSubmitSuccess(draft);
      return true;
    } catch (error) {
      const apiError = this.ensureApiError(error);

      if (apiError.code === 'TITULAR_NOT_FOUND') {
        this.formStore.setTitularCreationRequired(draft, 'create', null);
      }

      this.formStore.setError(apiError);
      return false;
    }
  }

  async update(dominio: string, draft: AutomotorDraft): Promise<boolean> {
    this.formStore.setSubmitLoading();

    try {
      await this.automotoresRepository.update(dominio, draft);
      this.formStore.setSubmitSuccess(draft);
      return true;
    } catch (error) {
      const apiError = this.ensureApiError(error);

      if (apiError.code === 'TITULAR_NOT_FOUND') {
        this.formStore.setTitularCreationRequired(draft, 'update', dominio);
      }

      this.formStore.setError(apiError);
      return false;
    }
  }

  async delete(dominio: string): Promise<boolean> {
    this.formStore.setDeleteLoading();

    try {
      await this.automotoresRepository.delete(dominio);
      this.formStore.setDeleteSuccess();
      return true;
    } catch (error) {
      this.formStore.setError(this.ensureApiError(error));
      return false;
    }
  }

  clearError(): void {
    this.formStore.clearError();
  }

  updateCurrentCuitTitular(cuitTitular: string): void {
    this.formStore.updateCurrentCuitTitular(cuitTitular);
  }

  updatePendingDraft(draft: AutomotorDraft): void {
    this.formStore.updatePendingDraft(draft);
  }

  cancelTitularCreation(): void {
    this.formStore.cancelTitularCreation();
  }

  async createTitularAndRetry(nombreCompleto: string): Promise<boolean> {
    const pendingDraft = this.formStore.pendingDraft();
    const pendingOperation = this.formStore.pendingOperation();

    if (!pendingDraft || !pendingOperation) {
      return false;
    }

    this.formStore.setTitularCreationLoading();
    this.formStore.setSubmitLoading();

    try {
      const mutationDraft: AutomotorMutationDraft = {
        ...pendingDraft,
        nombreTitular: nombreCompleto.trim(),
      };

      if (pendingOperation === 'update') {
        const pendingDominio = this.formStore.pendingDominio();

        if (!pendingDominio) {
          throw new ApiError(0, 'No se encontro el dominio para reintentar la actualizacion.');
        }

        await this.automotoresRepository.update(pendingDominio, mutationDraft);
      } else {
        await this.automotoresRepository.create(mutationDraft);
      }

      this.formStore.setTitularCreationSuccess();
      this.formStore.setSubmitSuccess(pendingDraft);
      return true;
    } catch (error) {
      this.formStore.setTitularCreationError();
      this.formStore.setError(this.ensureApiError(error));
      return false;
    }
  }

  private ensureApiError(error: unknown): ApiError {
    if (isApiError(error)) {
      return error;
    }

    return new ApiError(0, 'No se pudo completar la operacion del formulario. Intenta nuevamente.');
  }
}

import { Injectable, computed, inject } from '@angular/core';
import { ApiError, ApiFieldError, isApiError } from '../../../../core/http/api-error';
import { AutomotorDraft } from '../../domain/models/automotor-draft';
import {
  AUTOMOTORES_REPOSITORY,
  AutomotorMutationDraft,
  AutomotoresRepository,
} from '../../infrastructure/repositories/automotores-repository';
import {
  TITULARES_REPOSITORY,
  TitularesRepository,
} from '../../infrastructure/repositories/titulares-repository';
import { mapAutomotorToDraft } from '../../infrastructure/mappers/automotor.mapper';
import { AutomotorFormStore } from '../stores/automotor-form-store';

@Injectable({ providedIn: 'root' })
export class AutomotorFormFacade {
  private readonly automotoresRepository = inject<AutomotoresRepository>(AUTOMOTORES_REPOSITORY);
  private readonly titularesRepository = inject<TitularesRepository>(TITULARES_REPOSITORY);
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
      const hasTitular = await this.lookupTitularBeforeSubmit(
        draft.cuitTitular,
        draft,
        'create',
        null,
      );

      if (!hasTitular) {
        return false;
      }

      await this.automotoresRepository.create(draft);
      this.formStore.setSubmitSuccess(draft);
      return true;
    } catch (error) {
      this.formStore.setError(this.ensureApiError(error));
      return false;
    }
  }

  async update(dominio: string, draft: AutomotorDraft): Promise<boolean> {
    this.formStore.setSubmitLoading();

    try {
      const hasTitular = await this.lookupTitularBeforeSubmit(
        draft.cuitTitular,
        draft,
        'update',
        dominio,
      );

      if (!hasTitular) {
        return false;
      }

      await this.automotoresRepository.update(dominio, draft);
      this.formStore.setSubmitSuccess(draft);
      return true;
    } catch (error) {
      this.formStore.setError(this.ensureApiError(error));
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

  private async lookupTitularBeforeSubmit(
    cuit: string,
    draft: AutomotorDraft,
    operation: 'create' | 'update',
    dominio: string | null,
  ): Promise<boolean> {
    this.formStore.setTitularLookupLoading();

    try {
      const titular = await this.titularesRepository.getByCuit(cuit);

      if (!titular) {
        this.formStore.setTitularLookupNotFound();
        this.formStore.setTitularCreationRequired(draft, operation, dominio);
        this.formStore.setError(
          new ApiError(422, 'No existe un sujeto para el CUIT informado.', 'TITULAR_NOT_FOUND', [
            this.mapFieldError(
              'nombreTitular',
              'No existe un sujeto para este CUIT. Completa el nombre para crearlo junto al automotor.',
            ),
          ]),
        );
        return false;
      }

      this.formStore.setTitularLookupSuccess(titular);
      return true;
    } catch (error) {
      this.formStore.setTitularLookupError();
      throw error;
    }
  }

  private mapFieldError(field: string, message: string): ApiFieldError {
    return { field, message };
  }

  private ensureApiError(error: unknown): ApiError {
    if (isApiError(error)) {
      return error;
    }

    return new ApiError(0, 'No se pudo completar la operacion del formulario. Intenta nuevamente.');
  }
}

import { expect, type Page } from '@playwright/test';
import type { AutomotorDraft } from '../support/test-data';

export class AutomotorFormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoCreate(): Promise<void> {
    await this.page.goto('/crear');
    await expect(this.page.locator('#automotor-form')).toBeVisible();
  }

  async gotoEdit(dominio: string): Promise<void> {
    await this.page.goto(`/${dominio}/editar`);
    await expect(this.page.locator('#automotor-form')).toBeVisible();
  }

  async fillDraft(draft: AutomotorDraft): Promise<void> {
    await this.page.locator('#automotor-form-dominio').fill(draft.dominio);
    await this.page.locator('#automotor-form-chasis').fill(draft.chasis);
    await this.page.locator('#automotor-form-motor').fill(draft.motor);
    await this.page.locator('#automotor-form-color').fill(draft.color);
    await this.page.locator('#automotor-form-fecha-fabricacion').fill(draft.fechaFabricacion);
    await this.page.locator('#automotor-form-cuit-titular').fill(draft.cuitTitular);
  }

  async fillEditFields(fields: {
    chasis?: string;
    motor?: string;
    color?: string;
    fechaFabricacion?: string;
    cuitTitular?: string;
  }): Promise<void> {
    if (fields.chasis !== undefined) {
      await this.page.locator('#automotor-form-chasis').fill(fields.chasis);
    }

    if (fields.motor !== undefined) {
      await this.page.locator('#automotor-form-motor').fill(fields.motor);
    }

    if (fields.color !== undefined) {
      await this.page.locator('#automotor-form-color').fill(fields.color);
    }

    if (fields.fechaFabricacion !== undefined) {
      await this.page.locator('#automotor-form-fecha-fabricacion').fill(fields.fechaFabricacion);
    }

    if (fields.cuitTitular !== undefined) {
      await this.page.locator('#automotor-form-cuit-titular').fill(fields.cuitTitular);
    }
  }

  async submit(): Promise<void> {
    await this.page.locator('#automotor-form-submit').click();
  }

  async confirmCreate(): Promise<void> {
    await expect(this.page.locator('#automotor-create-confirmation-dialog')).toBeVisible();
    await this.page.locator('#automotor-confirmation-confirm').click();
  }

  async cancelCreateConfirmation(): Promise<void> {
    await expect(this.page.locator('#automotor-create-confirmation-dialog')).toBeVisible();
    await this.page.locator('#automotor-confirmation-cancel').click();
  }

  async createInlineTitular(nombreCompleto: string): Promise<void> {
    await expect(this.page.locator('#titular-inline-section')).toBeVisible();
    await this.page.locator('#titular-inline-nombre-completo').fill(nombreCompleto);
    await this.page.locator('#titular-inline-submit').click();
  }
}

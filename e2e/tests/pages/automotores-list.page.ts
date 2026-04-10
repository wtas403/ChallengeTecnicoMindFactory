import { expect, type Locator, type Page } from '@playwright/test';

export class AutomotoresListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get searchInput(): Locator {
    return this.page.locator('#automotores-search');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.locator('#automotores-list-section')).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  async openCreate(): Promise<void> {
    await this.page.locator('#automotores-create-link').click();
  }

  async openEdit(dominio: string): Promise<void> {
    await this.page.locator(`#automotor-${dominio}-edit`).click();
  }

  async openDeleteDialog(dominio: string): Promise<void> {
    await this.page.locator(`#automotor-${dominio}-delete`).click();
    await expect(this.page.locator('#automotor-delete-confirmation-dialog')).toBeVisible();
  }

  async confirmDelete(): Promise<void> {
    await this.page.locator('#automotor-delete-confirm').click();
  }

  async cancelDelete(): Promise<void> {
    await this.page.locator('#automotor-delete-cancel').click();
  }
}

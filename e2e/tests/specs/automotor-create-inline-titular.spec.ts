import { expect, test } from '@playwright/test';
import { AutomotorFormPage } from '../pages/automotor-form.page';
import { AutomotoresListPage } from '../pages/automotores-list.page';
import { buildDraft, uniqueValidCuit } from '../support/test-data';

test.describe('Automotores - alta con titular inexistente', () => {
  test('crea titular inline y completa el alta', async ({ page }) => {
    const formPage = new AutomotorFormPage(page);
    const listPage = new AutomotoresListPage(page);
    const draft = buildDraft({ cuitTitular: uniqueValidCuit() });

    await formPage.gotoCreate();
    await formPage.fillDraft(draft);
    await formPage.submit();
    await formPage.confirmCreate();

    await expect(page.locator('#titular-inline-section')).toBeVisible();
    await formPage.createInlineTitular('Titular E2E');

    await expect(page).toHaveURL(/\/$/);
    await listPage.search(draft.dominio);
    await expect(page.locator('#automotores-table')).toContainText(draft.dominio);

    await listPage.openDeleteDialog(draft.dominio);
    await listPage.confirmDelete();
    await expect(page.locator(`#automotor-${draft.dominio}-delete`)).toHaveCount(0);
  });
});

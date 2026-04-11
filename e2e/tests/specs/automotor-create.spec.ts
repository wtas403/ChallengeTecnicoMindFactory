import { expect, test } from '@playwright/test';
import { AutomotorFormPage } from '../pages/automotor-form.page';
import { AutomotoresListPage } from '../pages/automotores-list.page';
import { buildDraft } from '../support/test-data';

test.describe('Automotores - alta', () => {
  test('crea automotor con titular existente', async ({ page }) => {
    const formPage = new AutomotorFormPage(page);
    const listPage = new AutomotoresListPage(page);
    const draft = buildDraft({ cuitTitular: '20123456786' });

    await formPage.gotoCreate();
    await formPage.fillDraft(draft);

    await formPage.submit();
    const confirmationDialog = page.locator('#automotor-create-confirmation-dialog');
    await expect(confirmationDialog).toContainText('Chasis');
    await expect(confirmationDialog).toContainText(draft.chasis);
    await expect(confirmationDialog).toContainText('Motor');
    await expect(confirmationDialog).toContainText(draft.motor);
    await formPage.cancelCreateConfirmation();
    await expect(page.locator('#automotor-create-confirmation-dialog')).toBeHidden();

    await formPage.submit();
    await formPage.confirmCreate();
    await expect(page).toHaveURL(/\/$/);

    await listPage.search(draft.dominio);
    await expect(page.locator('#automotores-table')).toContainText(draft.dominio);

    await listPage.openDeleteDialog(draft.dominio);
    await listPage.confirmDelete();
    await expect(page.locator(`#automotor-${draft.dominio}-delete`)).toHaveCount(0);
  });
});

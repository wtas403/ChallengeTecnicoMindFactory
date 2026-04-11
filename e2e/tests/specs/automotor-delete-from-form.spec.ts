import { expect, test } from '@playwright/test';
import { AutomotorFormPage } from '../pages/automotor-form.page';
import { AutomotoresListPage } from '../pages/automotores-list.page';
import { createAutomotor } from '../support/api';
import { buildDraft } from '../support/test-data';

test.describe('Automotores - eliminacion desde formulario', () => {
  test('permite cancelar y luego confirmar la eliminacion', async ({ page, request }) => {
    const formPage = new AutomotorFormPage(page);
    const listPage = new AutomotoresListPage(page);
    const draft = buildDraft({ cuitTitular: '20123456786' });

    await createAutomotor(request, draft);

    await formPage.gotoEdit(draft.dominio);

    await formPage.requestDelete();
    await formPage.cancelDelete();
    await expect(page.locator('#automotor-form-delete-confirm')).toHaveCount(0);

    await formPage.requestDelete();
    await formPage.confirmDelete();
    await expect(page).toHaveURL(/\/$/);

    await listPage.search(draft.dominio);
    await expect(page.locator(`#automotor-${draft.dominio}-delete`)).toHaveCount(0);
  });
});

import { expect, test } from '@playwright/test';
import { AutomotoresListPage } from '../pages/automotores-list.page';
import { buildDraft } from '../support/test-data';
import { createAutomotor } from '../support/api';

test.describe('Automotores - eliminacion', () => {
  test('elimina automotor desde el listado', async ({ page, request }) => {
    const draft = buildDraft({ cuitTitular: '20123456786' });
    const listPage = new AutomotoresListPage(page);

    await createAutomotor(request, draft);

    await listPage.goto();
    await listPage.search(draft.dominio);
    await expect(page.locator('#automotores-table')).toContainText(draft.dominio);

    await listPage.openDeleteDialog(draft.dominio);
    await listPage.confirmDelete();

    await expect(page.locator(`#automotor-${draft.dominio}-delete`)).toHaveCount(0);
  });
});

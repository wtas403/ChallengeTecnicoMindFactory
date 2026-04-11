import { expect, test } from '@playwright/test';
import { AutomotorFormPage } from '../pages/automotor-form.page';
import { AutomotoresListPage } from '../pages/automotores-list.page';
import { createAutomotor, deleteAutomotor } from '../support/api';
import { buildDraft, uniqueValidCuit } from '../support/test-data';

test.describe('Automotores - edicion con titular inline', () => {
  test('muestra error global si el dominio no existe', async ({ page }) => {
    const formPage = new AutomotorFormPage(page);

    await formPage.gotoEdit('ZZ999ZZ');
    await expect(page.locator('#automotor-form-global-error')).toContainText(
      'No existe un automotor para el dominio informado.',
    );
  });

  test('permite cancelar el flujo inline al editar', async ({ page, request }) => {
    const formPage = new AutomotorFormPage(page);
    const draft = buildDraft({ cuitTitular: '20123456786' });

    await createAutomotor(request, draft);

    try {
      await formPage.gotoEdit(draft.dominio);
      await formPage.fillEditFields({ cuitTitular: uniqueValidCuit() });
      await formPage.submit();
      await formPage.confirmSubmit();

      await expect(page.locator('#titular-inline-section')).toBeVisible();
      await page.locator('#titular-inline-cancel').click();
      await expect(page.locator('#titular-inline-section')).toHaveCount(0);
      await expect(page.locator('#automotor-form-submit')).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/${draft.dominio}/editar$`));
    } finally {
      await deleteAutomotor(request, draft.dominio);
    }
  });

  test('crea titular inline y completa la actualizacion', async ({ page, request }) => {
    const formPage = new AutomotorFormPage(page);
    const listPage = new AutomotoresListPage(page);
    const draft = buildDraft({ cuitTitular: '20123456786' });
    const newCuit = uniqueValidCuit();
    const newColor = 'Verde Inline E2E';

    await createAutomotor(request, draft);

    try {
      await formPage.gotoEdit(draft.dominio);
      await formPage.fillEditFields({
        cuitTitular: newCuit,
        color: newColor,
      });
      await formPage.submit();
      await formPage.confirmSubmit();

      await expect(page.locator('#titular-inline-section')).toBeVisible();
      await formPage.createInlineTitular('Titular Inline Edicion E2E');

      await expect(page).toHaveURL(/\/$/);

      await listPage.search(draft.dominio);
      await listPage.openEdit(draft.dominio);
      await expect(page.locator('#automotor-form-cuit-titular')).toHaveValue(newCuit);
      await expect(page.locator('#automotor-form-color')).toHaveValue(newColor);
    } finally {
      await deleteAutomotor(request, draft.dominio);
    }
  });
});

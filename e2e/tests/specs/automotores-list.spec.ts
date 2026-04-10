import { expect, test } from '@playwright/test';
import { AutomotoresListPage } from '../pages/automotores-list.page';

test.describe('Automotores - listado', () => {
  test('permite buscar, ordenar y paginar resultados', async ({ page }) => {
    const listPage = new AutomotoresListPage(page);

    await listPage.goto();

    await expect(page.locator('#automotores-table')).toContainText('AA123BB');

    await listPage.search('AB456CD');
    await expect(page.locator('#automotores-table')).toContainText('AB456CD');

    await listPage.search('27345678901');
    await expect(page.locator('#automotores-table')).toContainText('AB456CD');

    const dominioHeader = page.locator('#automotores-table thead th').first();
    await expect(dominioHeader).toHaveAttribute('aria-sort', 'ascending');
    await dominioHeader.locator('button').click();
    await expect(dominioHeader).toHaveAttribute('aria-sort', 'descending');

    await page.locator('#automotores-page-size').selectOption('5');
    await expect(page.locator('#automotores-page-indicator')).toContainText('Pagina 1 de');
  });

  test('muestra dialogo de eliminacion y permite cancelarlo', async ({ page }) => {
    const listPage = new AutomotoresListPage(page);

    await listPage.goto();
    await listPage.openDeleteDialog('AA123BB');
    await listPage.cancelDelete();

    await expect(page.locator('#automotor-delete-confirmation-dialog')).toBeHidden();
  });
});

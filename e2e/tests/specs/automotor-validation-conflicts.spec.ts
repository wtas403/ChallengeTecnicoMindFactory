import { expect, test } from '@playwright/test';
import { AutomotorFormPage } from '../pages/automotor-form.page';
import { createAutomotor, deleteAutomotor } from '../support/api';
import { buildDraft, uniqueDominio } from '../support/test-data';

test.describe('Automotores - validaciones y conflictos', () => {
  test('valida errores de formulario en alta', async ({ page }) => {
    const formPage = new AutomotorFormPage(page);

    await formPage.gotoCreate();
    await formPage.submit();

    await expect(page.locator('#automotor-form-dominio-error')).toContainText(
      'Este campo es obligatorio.',
    );
    await expect(page.locator('#automotor-form-chasis-error')).toContainText(
      'Este campo es obligatorio.',
    );
    await expect(page.locator('#automotor-form-cuitTitular-error')).toContainText(
      'Este campo es obligatorio.',
    );

    await formPage.fillDraft({
      dominio: '123',
      chasis: 'CHS-E2E-VALID',
      motor: 'MTR-E2E-VALID',
      color: 'Negro',
      fechaFabricacion: '209901',
      cuitTitular: '20123456780',
    });
    await formPage.submit();

    await expect(page.locator('#automotor-form-dominio-error')).toContainText(
      'El dominio debe tener formato AAA999 o AA999AA.',
    );
    await expect(page.locator('#automotor-form-fechaFabricacion-error')).toContainText(
      'La fecha debe tener formato YYYYMM, mes valido y no ser futura.',
    );
    await expect(page.locator('#automotor-form-cuitTitular-error')).toContainText(
      'El CUIT ingresado no es valido.',
    );
    await expect(page.locator('#automotor-create-confirmation-dialog')).toHaveCount(0);
  });

  test('muestra errores de conflicto al crear automotores', async ({ page }) => {
    const formPage = new AutomotorFormPage(page);
    const uniqueSuffix = uniqueDominio();
    const draft = buildDraft({
      dominio: 'AA123BB',
      chasis: `CHS-${uniqueSuffix}`,
      motor: `MTR-${uniqueSuffix}`,
      cuitTitular: '20123456786',
    });

    await formPage.gotoCreate();
    await formPage.fillDraft(draft);
    await formPage.submit();
    await formPage.confirmCreate();

    await expect(page.locator('#automotor-form-dominio-error')).toContainText(
      'Ya existe un automotor para el dominio informado.',
    );

    await page.locator('#automotor-form-dominio').fill(uniqueDominio());
    await page.locator('#automotor-form-chasis').fill('CHS-0001');
    await page.locator('#automotor-form-motor').fill(`MTR-${uniqueDominio()}`);
    await formPage.submit();
    await formPage.confirmCreate();

    await expect(page.locator('#automotor-form-chasis-error')).toContainText(
      'Ya existe un automotor con el chasis informado.',
    );

    await page.locator('#automotor-form-chasis').fill(`CHS-${uniqueDominio()}`);
    await page.locator('#automotor-form-motor').fill('MTR-0001');
    await formPage.submit();
    await formPage.confirmCreate();

    await expect(page.locator('#automotor-form-motor-error')).toContainText(
      'Ya existe un automotor con el motor informado.',
    );
  });

  test('muestra conflictos al editar automotor', async ({ page, request }) => {
    const formPage = new AutomotorFormPage(page);
    const draft = buildDraft({ cuitTitular: '20123456786' });

    await createAutomotor(request, draft);

    try {
      await formPage.gotoEdit(draft.dominio);

      await formPage.fillEditFields({ chasis: 'CHS-0001' });
      await formPage.submit();
      await formPage.confirmSubmit();
      await expect(page.locator('#automotor-form-chasis-error')).toContainText(
        'Ya existe un automotor con el chasis informado.',
      );

      await formPage.fillEditFields({
        chasis: draft.chasis,
        motor: 'MTR-0001',
      });
      await formPage.submit();
      await formPage.confirmSubmit();
      await expect(page.locator('#automotor-form-motor-error')).toContainText(
        'Ya existe un automotor con el motor informado.',
      );
    } finally {
      await deleteAutomotor(request, draft.dominio);
    }
  });
});

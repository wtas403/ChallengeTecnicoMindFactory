import { expect, test } from "@playwright/test";
import { AutomotorFormPage } from "../pages/automotor-form.page";
import { buildDraft, uniqueValidCuit } from "../support/test-data";
import { createAutomotor, createSujeto, deleteAutomotor } from "../support/api";

test.describe("Automotores - edicion", () => {
  test("actualiza datos y valida guard de cambios pendientes", async ({
    page,
    request,
  }) => {
    const formPage = new AutomotorFormPage(page);
    const draft = buildDraft({ cuitTitular: "20123456786" });
    const reassignmentCuit = uniqueValidCuit();

    await createAutomotor(request, draft);
    await createSujeto(request, {
      cuit: reassignmentCuit,
      nombreCompleto: "Titular Reasignado E2E",
    });

    try {
      await formPage.gotoEdit(draft.dominio);

      await formPage.fillEditFields({
        color: "Plateado E2E",
        cuitTitular: reassignmentCuit,
      });

      await expect(page.locator("#automotor-form-reassignment")).toBeVisible();
      await formPage.submit();
      await formPage.confirmSubmit();
      await expect(page).toHaveURL(/\/$/);

      await formPage.gotoEdit(draft.dominio);
      await expect(page.locator("#automotor-form-color")).toHaveValue(
        "Plateado E2E",
      );
      await expect(page.locator("#automotor-form-cuit-titular")).toHaveValue(
        reassignmentCuit,
      );

      await formPage.fillEditFields({ color: "Color temporal E2E" });

      page.once("dialog", (dialog) => {
        void dialog.dismiss();
      });
      await page.locator("#automotor-form-back-link").click();
      await expect(page).toHaveURL(new RegExp(`/${draft.dominio}/editar$`));

      page.once("dialog", (dialog) => {
        void dialog.accept();
      });
      await page.locator("#automotor-form-back-link").click();
      await expect(page).toHaveURL(/\/$/);
    } finally {
      await deleteAutomotor(request, draft.dominio);
    }
  });
});

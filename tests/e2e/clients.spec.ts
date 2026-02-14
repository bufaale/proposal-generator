import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../helpers/test-utils";

test.describe("Clients", () => {
  let testUser: { id: string; email: string };

  test.beforeAll(async () => {
    testUser = await createTestUser("clients");
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email);
  });

  test("clients list shows empty state for new user", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(
      page.getByRole("heading", { name: "Clients" }),
    ).toBeVisible();
    await expect(page.getByText(/no clients yet/i)).toBeVisible();
  });

  test("clients list shows usage badge", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(page.getByText(/\/5 clients/i)).toBeVisible();
  });

  test("add client dialog opens", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page
      .getByRole("button", { name: /add client/i })
      .first()
      .click();
    await expect(
      page.getByRole("dialog").getByText("Add New Client"),
    ).toBeVisible();
  });

  test.describe.serial("CRUD operations", () => {
    test("create a new client", async ({ page }) => {
      await page.goto("/dashboard/clients");
      await page
        .getByRole("button", { name: /add client/i })
        .first()
        .click();

      // Fill dialog form
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel(/name/i).fill("Acme Corporation");
      await dialog.getByLabel(/email/i).fill("contact@acme.example.com");
      await dialog.getByLabel(/company/i).fill("Acme Corp");

      // Submit
      await dialog
        .getByRole("button", { name: /add|save|create/i })
        .click();

      // Wait for reload and verify client appears
      await expect(page.getByText("Acme Corporation")).toBeVisible({
        timeout: 10_000,
      });
    });

    test("view client detail page", async ({ page }) => {
      await page.goto("/dashboard/clients");
      await page.getByRole("link", { name: "Acme Corporation" }).click();
      await expect(page).toHaveURL(/\/dashboard\/clients\//);
      await expect(
        page.getByRole("heading", { name: "Acme Corporation" }),
      ).toBeVisible();
      await expect(page.getByText("Acme Corp").first()).toBeVisible();
    });
  });
});

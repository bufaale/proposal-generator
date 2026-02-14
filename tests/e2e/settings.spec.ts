import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../helpers/test-utils";

test.describe("Settings", () => {
  let testUser: { id: string; email: string };

  test.beforeAll(async () => {
    testUser = await createTestUser("settings");
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email);
  });

  test("settings page shows profile section", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /profile settings/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("settings page shows brand customization section", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Brand Customization")).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.getByLabel(/primary color/i).first()).toBeVisible();
    await expect(page.getByLabel(/secondary color/i).first()).toBeVisible();
  });

  test("can update profile name", async ({ page }) => {
    await page.goto("/settings");

    // Wait for the form to load (it's a client component with useEffect)
    await expect(page.getByLabel(/full name/i)).toBeVisible({
      timeout: 10_000,
    });

    await page.getByLabel(/full name/i).fill("Updated Test Name");
    await page
      .getByRole("button", { name: /save changes/i })
      .click();

    // Verify toast notification
    await expect(page.getByText(/profile updated/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("can update brand settings", async ({ page }) => {
    await page.goto("/settings");

    // Wait for load
    await expect(page.getByLabel(/company name/i)).toBeVisible({
      timeout: 10_000,
    });

    await page.getByLabel(/company name/i).fill("E2E Test Co");
    await page
      .getByRole("button", { name: /save brand settings/i })
      .click();

    // Verify toast notification
    await expect(page.getByText(/brand settings updated/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("email field is disabled", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/email/i)).toBeDisabled();
    await expect(page.getByText(/email cannot be changed/i)).toBeVisible();
  });

  test("brand preview updates with colors", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByLabel(/company name/i)).toBeVisible({
      timeout: 10_000,
    });

    // The preview section should be visible
    await expect(page.getByText("Preview")).toBeVisible();
    await expect(
      page.getByText(/your company name|e2e test co/i),
    ).toBeVisible();
  });
});

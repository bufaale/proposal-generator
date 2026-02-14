import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  setUserPlan,
  createTestClient,
  deleteTestClient,
} from "../helpers/test-utils";

test.describe("Proposals", () => {
  let testUser: { id: string; email: string };
  let testClient: { id: string; name: string };

  test.beforeAll(async () => {
    testUser = await createTestUser("proposals");
    await setUserPlan(testUser.id, "pro");
    testClient = await createTestClient(testUser.id, "E2E Test Client");
  });

  test.afterAll(async () => {
    await deleteTestClient(testClient.id);
    await deleteTestUser(testUser.id);
  });

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email);
  });

  test("proposals list shows empty state for new user", async ({ page }) => {
    await page.goto("/dashboard/proposals");
    await expect(
      page.getByRole("heading", { name: "Proposals" }),
    ).toBeVisible();
    await expect(page.getByText(/no proposals yet/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /create proposal/i }).first(),
    ).toBeVisible();
  });

  test("new proposal page loads with form", async ({ page }) => {
    await page.goto("/dashboard/proposals/new");
    await expect(page.getByText(/project description/i)).toBeVisible();
  });

  test("create proposal button exists on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: /create proposal/i }),
    ).toBeVisible();
  });

  test("new proposal page has template selection", async ({ page }) => {
    await page.goto("/dashboard/proposals/new");
    await expect(page.getByText(/template/i).first()).toBeVisible();
  });

  test("new proposal page has client selection", async ({ page }) => {
    await page.goto("/dashboard/proposals/new");
    await expect(page.getByText(/client/i).first()).toBeVisible();
  });

  test("can navigate from proposals list to new proposal", async ({
    page,
  }) => {
    await page.goto("/dashboard/proposals");
    await page.getByRole("link", { name: /create proposal/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/proposals\/new/);
  });

  test("AI proposal generation works end-to-end", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/dashboard/proposals/new");

    // Fill in the project description (minimum 20 chars)
    const descriptionField = page
      .getByRole("textbox")
      .first();
    await descriptionField.fill(
      "Build a modern e-commerce website with product catalog, shopping cart, user authentication, and payment integration using Stripe. The site should be responsive and fast.",
    );

    // Submit the form to generate
    const generateBtn = page.getByRole("button", {
      name: /generate|create/i,
    });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }

    // Wait for AI generation - this can take up to 60s
    await expect(
      page.getByText(/generating|loading|please wait/i),
    ).toBeVisible({ timeout: 15_000 });

    // Wait for the proposal to be generated and shown
    await page.waitForURL("**/dashboard/proposals/**", { timeout: 90_000 });
  });
});

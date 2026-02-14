import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../helpers/test-utils";

// --- Public pages (no auth) ---

test.describe("Navigation - Public pages", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /proposals/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start creating proposals/i }),
    ).toBeVisible();
    await expect(page.getByText(/no credit card required/i)).toBeVisible();
  });

  test("landing page has features section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/how it works/i).first()).toBeVisible();
  });

  test("landing page has pricing section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
    await expect(page.getByText(/business/i).first()).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in/i }),
    ).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText(/create an account/i)).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up/i }),
    ).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("login page has link to signup", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("link", { name: /sign up/i }),
    ).toBeVisible();
  });

  test("signup page has link to login", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("link", { name: /sign in/i }),
    ).toBeVisible();
  });
});

// --- Authenticated pages ---

test.describe("Navigation - Authenticated pages", () => {
  let testUser: { id: string; email: string };

  test.beforeAll(async () => {
    testUser = await createTestUser("nav");
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email);
  });

  test("dashboard loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
  });

  test("proposals page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Proposals" }).click();
    await expect(page).toHaveURL(/\/dashboard\/proposals/);
    await expect(
      page.getByRole("heading", { name: "Proposals" }),
    ).toBeVisible();
  });

  test("clients page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Clients" }).click();
    await expect(page).toHaveURL(/\/dashboard\/clients/);
    await expect(
      page.getByRole("heading", { name: "Clients" }),
    ).toBeVisible();
  });

  test("templates page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Templates" }).click();
    await expect(page).toHaveURL(/\/dashboard\/templates/);
    await expect(
      page.getByRole("heading", { name: "Templates", exact: true }),
    ).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(
      page.getByRole("heading", { name: /profile settings/i }),
    ).toBeVisible();
  });

  test("billing page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Billing" }).click();
    await expect(page).toHaveURL(/\/settings\/billing/);
    await expect(
      page.getByRole("heading", { name: "Billing" }),
    ).toBeVisible();
  });
});

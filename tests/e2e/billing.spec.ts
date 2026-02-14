import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  setUserPlan,
} from "../helpers/test-utils";

test.describe("Billing", () => {
  let testUser: { id: string; email: string };

  test.beforeAll(async () => {
    testUser = await createTestUser("billing");
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test("free user sees current plan as Free", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();
    await expect(page).toHaveURL(/\/settings\/billing/);

    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(
      page.getByText(/proposals this month/i),
    ).toBeVisible();
    await expect(page.getByText(/total clients/i)).toBeVisible();
  });

  test("free user sees upgrade buttons", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();

    await expect(
      page.getByRole("button", { name: /upgrade/i }).first(),
    ).toBeVisible();
  });

  test("upgrade button redirects to Stripe checkout", async ({ page }) => {
    test.setTimeout(60_000);

    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();

    // Click first upgrade button (Pro monthly)
    await page
      .getByRole("button", { name: /upgrade/i })
      .first()
      .click();

    // Verify redirect to Stripe Checkout
    await page.waitForURL("**/checkout.stripe.com/**", { timeout: 30_000 });
    // We don't fill the Stripe form — Stripe Checkout uses iframes
    // that are not accessible to Playwright
  });

  test("pro user sees manage subscription button", async ({ page }) => {
    // Set user to Pro plan via API (simulates completed checkout)
    await setUserPlan(testUser.id, "pro");

    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();

    await expect(
      page.getByRole("button", { name: /manage subscription/i }),
    ).toBeVisible();
  });

  test("manage subscription opens Stripe portal", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();

    await page
      .getByRole("button", { name: /manage subscription/i })
      .click();

    await page.waitForURL("**/billing.stripe.com/**", { timeout: 15_000 });
  });
});

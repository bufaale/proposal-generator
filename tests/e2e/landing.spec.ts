import { test, expect } from "@playwright/test";

test.describe("Landing page — Proposal Generator", () => {
  test("hero mentions AI-generated proposals and $19/mo", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByText(/AI generates complete proposals/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Describe Your Project/i).first()
    ).toBeVisible();
    await expect(page.getByText(/\$19\/mo/).first()).toBeVisible();
  });

  test("hero mentions Proposify/PandaDoc competitors and CTA", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText(/Proposify/i).first()).toBeVisible();
    await expect(page.getByText(/PandaDoc/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Start Creating Proposals/i }).first()
    ).toBeVisible();
  });

  test("pricing section shows tiers and Most Popular", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(
      page.getByText("Simple, transparent pricing").first()
    ).toBeVisible();
    await expect(page.getByText("Most Popular").first()).toBeVisible();
    await expect(page.getByText("Monthly", { exact: true }).first()).toBeVisible();
  });
});

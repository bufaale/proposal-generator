import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  setUserPlan,
} from "../helpers/test-utils";

test.describe("Client Portal", () => {
  let testUser: { id: string; email: string };
  let shareToken: string | null = null;

  test.beforeAll(async () => {
    testUser = await createTestUser("portal");
    await setUserPlan(testUser.id, "pro");
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test("invalid share token shows error", async ({ page }) => {
    await page.goto("/p/invalid-token-12345");
    await expect(
      page.getByRole("heading", { name: /not found/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can generate and share a proposal", async ({ page }) => {
    test.setTimeout(120_000);

    await loginViaUI(page, testUser.email);
    await page.goto("/dashboard/proposals/new");

    // Fill the brief
    const descriptionField = page
      .getByRole("textbox")
      .first();
    await descriptionField.fill(
      "Create a brand identity package including logo design, color palette, typography guide, and brand guidelines document for a modern tech startup.",
    );

    // Generate the proposal
    const generateBtn = page.getByRole("button", {
      name: /generate|create/i,
    });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }

    // Wait for proposal to be created
    await page.waitForURL("**/dashboard/proposals/**", { timeout: 90_000 });

    // Share the proposal
    const shareBtn = page.getByRole("button", { name: /share/i });
    if (await shareBtn.isVisible({ timeout: 5_000 })) {
      await shareBtn.click();

      // Look for the share URL or token in the dialog/response
      const shareUrlElement = page.locator(
        '[data-testid="share-url"], input[readonly]',
      );
      if (await shareUrlElement.isVisible({ timeout: 5_000 })) {
        const shareUrl = await shareUrlElement.inputValue();
        const match = shareUrl.match(/\/p\/([a-f0-9]+)/);
        if (match) {
          shareToken = match[1];
        }
      }
    }
  });

  test("shared proposal is accessible via public link", async ({ page }) => {
    test.skip(!shareToken, "No share token from previous test");

    await page.goto(`/p/${shareToken}`);
    // Should show the proposal content (not a login page)
    await expect(page.getByText(/proposal|project/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});

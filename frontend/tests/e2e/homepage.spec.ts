import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display main content", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Firebase Studio/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
  });
});

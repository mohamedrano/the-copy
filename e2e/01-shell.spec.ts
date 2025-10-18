import { test, expect } from '@playwright/test';

test.describe('Shell Application', () => {
  test('should load the shell homepage', async ({ page }) => {
    await page.goto('/');

    // التحقق من العنوان
    await expect(page).toHaveTitle(/The Copy/i);

    // التحقق من وجود العنصر الرئيسي
    const shell = page.locator('[data-testid="the-copy-shell"]');
    await expect(shell).toBeVisible();

    // التحقق من وجود بطاقات التطبيقات
    const paneCards = page.locator('[data-testid="pane-card"]');
    await expect(paneCards).toHaveCount(4); // 4 تطبيقات فرعية
  });

  test('should have all app links', async ({ page }) => {
    await page.goto('/');

    // التحقق من وجود روابط جميع التطبيقات
    const basicEditorLink = page.locator('text=/المحرر الأساسي|Basic Editor/i');
    await expect(basicEditorLink).toBeVisible();

    const dramaAnalystLink = page.locator('text=/محلل الدراما|Drama Analyst/i');
    await expect(dramaAnalystLink).toBeVisible();

    const stationsLink = page.locator('text=/المحطات|Stations/i');
    await expect(stationsLink).toBeVisible();

    const multiAgentLink = page.locator('text=/العصف الذهني|Multi.*Agent|Story/i');
    await expect(multiAgentLink).toBeVisible();
  });

  test('should display pane summaries', async ({ page }) => {
    await page.goto('/');

    // التحقق من ملخصات الأطر
    const paneSummaries = page.locator('[data-testid="pane-summary"]');
    await expect(paneSummaries).toHaveCount(4);
  });
});

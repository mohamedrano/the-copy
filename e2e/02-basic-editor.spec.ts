import { test, expect } from '@playwright/test';

test.describe('Basic Editor Application', () => {
  test('should load basic editor page', async ({ page }) => {
    await page.goto('/basic-editor/');

    // انتظار التحميل
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // التحقق من أن الصفحة ليست Shell
    const shellElement = page.locator('[data-testid="the-copy-shell"]');
    await expect(shellElement).not.toBeVisible();

    // التحقق من العنوان (يجب أن يكون مختلفاً عن Shell)
    const title = await page.title();
    expect(title.toLowerCase()).not.toContain('unified workspace');

    // التحقق من المحتوى
    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/editor|محرر/);
  });

  test('should have unique page signature', async ({ page }) => {
    await page.goto('/basic-editor/');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    const content = await page.content();

    // يجب ألا يحتوي على توقيعات Shell
    expect(content).not.toContain('data-testid="the-copy-shell"');
    expect(content).not.toContain('data-testid="pane-card"');
  });
});

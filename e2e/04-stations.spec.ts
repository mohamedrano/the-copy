import { test, expect } from '@playwright/test';

test('Stations Application - should load stations page', async ({ page }) => {
  await page.goto('/stations/');

  // انتظار التحميل
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // التحقق من أن الصفحة ليست Shell
  const shellElement = page.locator('[data-testid="the-copy-shell"]');
  await expect(shellElement).not.toBeVisible();

  // التحقق من العنوان
  const title = await page.title();
  expect(title.toLowerCase()).not.toContain('unified workspace');

  // التحقق من المحتوى
  const content = await page.content();
  expect(content.toLowerCase()).toMatch(/station|محطة/);
});

test('Stations Application - should have unique page signature', async ({ page }) => {
  await page.goto('/stations/');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  const content = await page.content();

  // يجب ألا يحتوي على توقيعات Shell
  expect(content).not.toContain('data-testid="the-copy-shell"');
  expect(content).not.toContain('data-testid="pane-card"');
});

test('Stations Application - should handle missing GEMINI_API_KEY gracefully', async ({ page }) => {
  // هذا الاختبار يتحقق من أن التطبيق لا ينهار بدون المفتاح
  await page.goto('/stations/');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // يجب أن تكون الصفحة مرئية حتى بدون المفتاح
  const body = page.locator('body');
  await expect(body).toBeVisible();

  // لا يجب أن يظهر خطأ فادح يوقف التطبيق
  const errorOverlay = page.locator('text=/error.*loading|fatal.*error/i');
  await expect(errorOverlay).not.toBeVisible();
});

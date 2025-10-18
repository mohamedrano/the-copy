import { test, expect } from '@playwright/test';

test('Multi-Agent Story Application - should load multi-agent story page', async ({ page }) => {
  await page.goto('/multi-agent-story/');

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
  expect(content.toLowerCase()).toMatch(/agent|story|عصف/);
});

test('Multi-Agent Story Application - should have unique page signature', async ({ page }) => {
  await page.goto('/multi-agent-story/');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  const content = await page.content();

  // يجب ألا يحتوي على توقيعات Shell
  expect(content).not.toContain('data-testid="the-copy-shell"');
  expect(content).not.toContain('data-testid="pane-card"');
});

test('Multi-Agent Story Application - should render without critical errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/multi-agent-story/');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // السماح بأخطاء غير حرجة (favicon, API keys, etc.)
  const criticalErrors = errors.filter(e =>
    !e.includes('404') &&
    !e.includes('favicon') &&
    !e.includes('GEMINI_API_KEY') &&
    !e.includes('API_KEY')
  );

  expect(criticalErrors.length).toBe(0);
});

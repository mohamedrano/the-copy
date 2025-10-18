import { test, expect } from '@playwright/test';

test('Shell Application - should load the shell homepage', async ({ page }) => {
  await page.goto('/');

  // التحقق من العنوان
  await expect(page).toHaveTitle(/The Copy/i);

  // التحقق من وجود بطاقات التطبيقات
  const paneCards = page.getByTestId('pane-card');
  await expect(paneCards).toHaveCount(4); // 4 تطبيقات فرعية
});

test('Shell Application - should have all app links', async ({ page }) => {
  await page.goto('/');

  // التحقق من وجود روابط جميع التطبيقات
  const basicEditorLink = page.getByRole('link', { name: /المحرر الأساسي|Basic Editor/i });
  await expect(basicEditorLink).toBeVisible();

  const dramaAnalystLink = page.getByRole('link', { name: /محلل الدراما|Drama Analyst/i });
  await expect(dramaAnalystLink).toBeVisible();

  const stationsLink = page.getByRole('link', { name: /المحطات|Stations/i });
  await expect(stationsLink).toBeVisible();

  const multiAgentLink = page.getByRole('link', { name: /العصف الذهني|Multi.*Agent|Story/i });
  await expect(multiAgentLink).toBeVisible();
});

test('Shell Application - should display pane summaries', async ({ page }) => {
  await page.goto('/');

  // التحقق من ملخصات الأطر
  const paneSummaries = page.locator('[data-testid="pane-summary"]');
  await expect(paneSummaries).toHaveCount(4);
});

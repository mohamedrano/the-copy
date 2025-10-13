import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const routes = ['/', '/drama-analyst/', '/stations/', '/multi-agent-story/'];

test.describe('Smoke Routes', () => {
  for (const route of routes) {
    test(`route ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      await page.goto(`${BASE_URL}${route}`);
      await expect(page).toHaveTitle(/the copy/i);
      expect(consoleErrors, `console errors for ${route}`).toEqual([]);
    });
  }
});

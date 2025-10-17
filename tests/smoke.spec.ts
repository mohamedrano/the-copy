import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const CRITICAL_PATHS = [
  { path: '/', title: 'the copy', description: 'Main application' },
  { path: '/drama-analyst/', title: 'Drama Analyst', description: 'Drama analysis platform' },
  { path: '/stations/', title: 'Stations', description: 'Stations management system' },
  { path: '/multi-agent-story/', title: 'Multi-Agent Story', description: 'Multi-agent storytelling platform' }
];

test.describe('Production Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console Error: ${msg.text()}`);
      }
    });

    // Set up network error tracking
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.error(`Network Error: ${response.status()} ${response.url()}`);
      }
    });
  });

  for (const route of CRITICAL_PATHS) {
    test(`${route.path} loads successfully`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('response', (response) => {
        if (response.status() >= 400) {
          networkErrors.push(`${response.status()} ${response.url()}`);
        }
      });

      // Navigate to the route
      await page.goto(`${BASE_URL}${route.path}`);
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Check title
      await expect(page).toHaveTitle(new RegExp(route.title, 'i'));
      
      // Check that the page is not showing an error
      await expect(page.locator('body')).not.toContainText('Error');
      await expect(page.locator('body')).not.toContainText('خطأ');
      
      // Check for console errors
      expect(consoleErrors, `Console errors for ${route.path}`).toEqual([]);
      
      // Check for network errors
      expect(networkErrors, `Network errors for ${route.path}`).toEqual([]);
      
      // Check that the page has content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(0);
    });
  }

  test('Main application navigation works', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Check that the main page loads
    await expect(page).toHaveTitle(/the copy/i);
    
    // Check for navigation elements
    await expect(page.locator('h1')).toContainText('the copy');
    
    // Check that external app buttons are present
    const projectsButton = page.locator('button:has-text("المشاريع")');
    const templatesButton = page.locator('button:has-text("القوالب")');
    const exportButton = page.locator('button:has-text("التصدير")');
    
    await expect(projectsButton).toBeVisible();
    await expect(templatesButton).toBeVisible();
    await expect(exportButton).toBeVisible();
  });

  test('External applications load in iframes', async ({ page }) => {
    // Test Drama Analyst
    await page.goto(`${BASE_URL}/drama-analyst/`);
    await page.waitForLoadState('networkidle');
    
    // Check that iframe is present
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    
    // Test Stations
    await page.goto(`${BASE_URL}/stations/`);
    await page.waitForLoadState('networkidle');
    
    const iframe2 = page.locator('iframe');
    await expect(iframe2).toBeVisible();
    
    // Test Multi-Agent Story
    await page.goto(`${BASE_URL}/multi-agent-story/`);
    await page.waitForLoadState('networkidle');
    
    const iframe3 = page.locator('iframe');
    await expect(iframe3).toBeVisible();
  });

  test('Health check endpoint works', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/healthz`);
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBe('healthy\n');
  });

  test('Static assets are served correctly', async ({ page }) => {
    // Test that static assets are accessible
    const response = await page.goto(`${BASE_URL}/vite.svg`);
    expect(response?.status()).toBe(200);
    
    // Test that CSS files are served
    const cssResponse = await page.goto(`${BASE_URL}/assets/index.css`);
    expect(cssResponse?.status()).toBe(200);
  });

  test('Error handling works correctly', async ({ page }) => {
    // Test 404 handling
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Should redirect to main page or show 404
    const title = await page.title();
    expect(title).toMatch(/the copy/i);
  });

  test('Performance metrics are acceptable', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check for performance issues
    const metrics = await page.evaluate(() => {
      return {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    });
    
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });
});

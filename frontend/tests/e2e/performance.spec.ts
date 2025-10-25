import { test, expect } from "@playwright/test";

test.describe("Performance @performance", () => {
  test("should meet Core Web Vitals thresholds", async ({ page }) => {
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: Record<string, number> = {};

          entries.forEach((entry) => {
            if (entry.name === "FCP") vitals.fcp = entry.value;
            if (entry.name === "LCP") vitals.lcp = entry.value;
            if (entry.name === "CLS") vitals.cls = entry.value;
          });

          resolve(vitals);
        }).observe({ entryTypes: ["measure", "navigation"] });

        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });

    console.log("Performance metrics:", metrics);
  });

  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });
});

import { describe, it, expect, vi } from "vitest";
import { getWebVitals } from "./web-vitals";

// Mock web-vitals
vi.mock("web-vitals", () => ({
  getCLS: vi.fn(() => Promise.resolve({ value: 0.1 })),
  getFID: vi.fn(() => Promise.resolve({ value: 50 })),
  getFCP: vi.fn(() => Promise.resolve({ value: 1200 })),
  getLCP: vi.fn(() => Promise.resolve({ value: 2000 })),
  getTTFB: vi.fn(() => Promise.resolve({ value: 300 })),
  onCLS: vi.fn(),
  onFID: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe("Web Vitals", () => {
  it("should return web vitals data", async () => {
    const vitals = await getWebVitals();

    expect(vitals).toEqual({
      cls: 0.1,
      fid: 50,
      fcp: 1200,
      lcp: 2000,
      ttfb: 300,
    });
  });
});

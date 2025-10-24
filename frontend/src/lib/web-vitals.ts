import {
  onCLS,
  onFID,
  onFCP,
  onLCP,
  onTTFB,
} from "web-vitals";
import * as Sentry from "@sentry/react";

export function reportWebVitals() {
  onCLS((metric) => {
    Sentry.addBreadcrumb({
      category: "web-vital",
      message: `CLS: ${metric.value}`,
      level: "info",
      data: metric as any,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("CLS:", metric);
    }
  });

  onFID((metric) => {
    Sentry.addBreadcrumb({
      category: "web-vital",
      message: `FID: ${metric.value}ms`,
      level: "info",
      data: metric as any,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("FID:", metric);
    }
  });

  onFCP((metric) => {
    Sentry.addBreadcrumb({
      category: "web-vital",
      message: `FCP: ${metric.value}ms`,
      level: "info",
      data: metric as any,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("FCP:", metric);
    }
  });

  onLCP((metric) => {
    Sentry.addBreadcrumb({
      category: "web-vital",
      message: `LCP: ${metric.value}ms`,
      level: "info",
      data: metric as any,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("LCP:", metric);
    }
  });

  onTTFB((metric) => {
    Sentry.addBreadcrumb({
      category: "web-vital",
      message: `TTFB: ${metric.value}ms`,
      level: "info",
      data: metric as any,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("TTFB:", metric);
    }
  });
}

export async function getWebVitals() {
  // Note: The new web-vitals API doesn't provide synchronous getters
  // This function should be updated to use the callback-based API
  return {
    cls: 0,
    fid: 0,
    fcp: 0,
    lcp: 0,
    ttfb: 0,
  };
}

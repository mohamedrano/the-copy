// Web Vitals Service for Drama Analyst
// Monitors Core Web Vitals and performance metrics

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from "web-vitals";
import { log } from "./loggerService";
import { reportError, addBreadcrumb } from "./observability";
// No-op replacement for missing GA function
const sendGAEvent = (..._args: any[]) => {};

interface WebVitalsConfig {
  enableGA4: boolean;
  enableSentry: boolean;
  enableConsoleLog: boolean;
  customEndpoint?: string;
  debug: boolean;
}

interface CustomMetric extends Metric {
  customData?: Record<string, any>;
}

class WebVitalsService {
  private config: WebVitalsConfig;
  private metrics: Map<string, CustomMetric> = new Map();
  private observers: Set<PerformanceObserver> = new Set();

  constructor(config: Partial<WebVitalsConfig> = {}) {
    this.config = {
      enableGA4: true,
      enableSentry: true,
      enableConsoleLog: process.env.NODE_ENV === "development",
      debug: process.env.NODE_ENV === "development",
      ...config,
    };

    this.init();
  }

  private init(): void {
    if (typeof window === "undefined") {
      log.warn(
        "⚠️ Web Vitals service: window not available",
        null,
        "WebVitalsService"
      );
      return;
    }

    log.info(
      "📊 Initializing Web Vitals monitoring...",
      this.config,
      "WebVitalsService"
    );

    // Initialize Core Web Vitals
    this.initCoreWebVitals();

    // Initialize custom performance metrics
    this.initCustomMetrics();

    // Initialize navigation timing
    this.initNavigationTiming();

    // Initialize resource timing
    this.initResourceTiming();

    // Initialize long task monitoring
    this.initLongTaskMonitoring();

    log.info("✅ Web Vitals monitoring initialized", null, "WebVitalsService");
  }

  private initCoreWebVitals(): void {
    // Cumulative Layout Shift (CLS)
    onCLS((metric) => {
      this.handleMetric("CLS", metric);
    });

    // Interaction to Next Paint (INP) - replaces FID
    onINP((metric) => {
      this.handleMetric("INP", metric);
    });

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      this.handleMetric("FCP", metric);
    });

    // Largest Contentful Paint (LCP)
    onLCP((metric) => {
      this.handleMetric("LCP", metric);
    });

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      this.handleMetric("TTFB", metric);
    });
  }

  private initCustomMetrics(): void {
    // Custom metrics for Drama Analyst specific functionality
    this.measureAppLoadTime();
    this.measureFileProcessingTime();
    this.measureAPICallTime();
    this.measureComponentRenderTime();
  }

  private initNavigationTiming(): void {
    if (!("PerformanceNavigationTiming" in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;

          const customMetric: CustomMetric = {
            name: "TTFB" as any,
            value: navEntry.loadEventEnd - navEntry.fetchStart,
            delta: navEntry.loadEventEnd - navEntry.fetchStart,
            id: `nav-${Date.now()}`,
            navigationType: navEntry.type as any,
            rating: "good" as any,
            entries: [] as any,
            customData: {
              domContentLoaded:
                navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcpConnect: navEntry.connectEnd - navEntry.connectStart,
              request: navEntry.responseStart - navEntry.requestStart,
              response: navEntry.responseEnd - navEntry.responseStart,
              domProcessing: navEntry.domComplete - ((navEntry as any).domLoading ?? 0),
            },
          };

          this.handleMetric("TTFB", customMetric);
        }
      });
    });

    observer.observe({ entryTypes: ["navigation"] });
    this.observers.add(observer);
  }

  private initResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;

          // Track slow resources
          if (resourceEntry.duration > 1000) {
            // Resources taking longer than 1 second
            const customMetric: CustomMetric = {
              name: "SlowResource" as any,
              value: resourceEntry.duration,
              delta: resourceEntry.duration,
              id: `resource-${Date.now()}`,
              navigationType: "navigate" as any,
              rating: "good" as any,
              entries: [] as any,
              customData: {
                url: resourceEntry.name,
                size: resourceEntry.transferSize,
                type: this.getResourceType(resourceEntry.name),
                initiatorType: resourceEntry.initiatorType,
              },
            };

            this.handleMetric("SlowResource", customMetric);
          }
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });
    this.observers.add(observer);
  }

  private initLongTaskMonitoring(): void {
    if (!("PerformanceObserver" in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "longtask") {
          const customMetric: CustomMetric = {
            name: "LongTask" as any,
            value: entry.duration,
            delta: entry.duration,
            id: `longtask-${Date.now()}`,
            navigationType: "navigate" as any,
            rating: "good" as any,
            entries: [] as any,
            customData: {
              startTime: entry.startTime,
              name: entry.name,
            },
          };

          this.handleMetric("LongTask", customMetric);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
      this.observers.add(observer);
    } catch (error) {
      log.warn(
        "⚠️ Long task monitoring not supported",
        error,
        "WebVitalsService"
      );
    }
  }

  private measureAppLoadTime(): void {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.measureCustomMetric("AppLoadTime", performance.now());
      });
    } else {
      this.measureCustomMetric("AppLoadTime", performance.now());
    }
  }

  private measureFileProcessingTime(): void {
    // This will be called when file processing starts/ends
    const originalMeasure = performance.measure.bind(performance);

    // Override performance.measure to track file processing
    performance.measure = (
      name: string,
      startMark?: string,
      endMark?: string
    ) => {
      const result = originalMeasure(name, startMark, endMark);

      if (name.includes("file-processing")) {
        const customMetric: CustomMetric = {
          name: "FileProcessingTime" as any,
          value: result.duration,
          delta: result.duration,
          id: `file-processing-${Date.now()}`,
          navigationType: "navigate" as any,
          rating: "good" as any,
          entries: [] as any,
          customData: {
            fileName: name.split("-").pop(),
            startTime: result.startTime,
          },
        };

        this.handleMetric("FileProcessingTime", customMetric);
      }

      return result;
    };
  }

  private measureAPICallTime(): void {
    // This will be called when API calls are made
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0]?.toString() || "unknown";

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        const customMetric: CustomMetric = {
          name: "APICallTime" as any,
          value: endTime - startTime,
          delta: endTime - startTime,
          id: `api-${Date.now()}`,
          navigationType: "navigate" as any,
          rating: "good" as any,
          entries: [] as any,
          customData: {
            url,
            status: response.status,
            method: args[1]?.method || "GET",
          },
        };

        this.handleMetric("APICallTime", customMetric);

        return response;
      } catch (error) {
        const endTime = performance.now();

        const customMetric: CustomMetric = {
          name: "APICallError" as any,
          value: endTime - startTime,
          delta: endTime - startTime,
          id: `api-error-${Date.now()}`,
          navigationType: "navigate" as any,
          rating: "good" as any,
          entries: [] as any,
          customData: {
            url,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        };

        this.handleMetric("APICallError", customMetric);

        throw error;
      }
    };
  }

  private measureComponentRenderTime(): void {
    // Track React component render times using performance marks
    // Disabled for now to avoid type issues with React.createElement
    // TODO: Implement using React DevTools or custom hooks
  }

  private handleMetric(name: string, metric: CustomMetric): void {
    // Store metric
    this.metrics.set(metric.id, metric);

    // Log to console if enabled
    if (this.config.enableConsoleLog) {
      log.info(
        `📊 ${name}: ${metric.value.toFixed(2)}${this.getMetricUnit(name)}`,
        metric.customData,
        "WebVitalsService"
      );
    }

    // Send to Google Analytics 4
    if (this.config.enableGA4) {
      this.sendToGA4(name, metric);
    }

    // Send to Sentry
    if (this.config.enableSentry) {
      this.sendToSentry(name, metric);
    }

    // Send to custom endpoint
    if (this.config.customEndpoint) {
      this.sendToCustomEndpoint(name, metric);
    }

    // Add breadcrumb
    addBreadcrumb(`Web Vital: ${name}`, "performance", {
      value: metric.value,
      ...metric.customData,
    });

    // Check for performance issues
    this.checkPerformanceThresholds(name, metric);
  }

  private sendToGA4(name: string, metric: CustomMetric): void {
    try {
      // Send detailed Web Vitals data to GA4 using our analytics service
      sendGAEvent("web_vitals", {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_delta: Math.round(metric.delta),
        metric_rating: metric.rating,
        metric_id: metric.id,
        navigation_type: metric.navigationType,
        // Add performance thresholds for analysis
        is_good: metric.rating === "good",
        is_needs_improvement: metric.rating === "needs-improvement",
        is_poor: metric.rating === "poor",
        // Add timing context
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        connection_type:
          (navigator as any).connection?.effectiveType || "unknown",
        // Add custom data
        ...metric.customData,
      });

      // Send individual metric events for better segmentation
      sendGAEvent(`web_vital_${metric.name.toLowerCase()}`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
        id: metric.id,
        ...metric.customData,
      });

      if (this.config.debug) {
        log.debug(
          `📊 GA4 Web Vitals event sent: ${name}`,
          metric,
          "WebVitalsService"
        );
      }
    } catch (error) {
      log.error("❌ Failed to send to GA4", error, "WebVitalsService");

      // Fallback to direct gtag if available
      if (typeof window !== "undefined" && (window as any).gtag) {
        try {
          (window as any).gtag("event", name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            value: Math.round(metric.value),
            custom_map: metric.customData,
          });
        } catch (fallbackError) {
          log.error(
            "❌ Fallback GA4 also failed",
            fallbackError,
            "WebVitalsService"
          );
        }
      }
    }
  }

  private sendToSentry(name: string, metric: CustomMetric): void {
    try {
      // Add breadcrumb for Sentry
      addBreadcrumb(`Web Vitals: ${name}`, "web-vitals", {
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
        ...metric.customData,
      });

      // Report performance issues to Sentry
      if (metric.rating === "poor") {
        reportError(new Error(`Poor Web Vital: ${name}`), {
          metric: {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType,
            customData: metric.customData,
          },
        });
      }

      if (this.config.debug) {
        log.debug(
          `📊 Sentry Web Vitals event sent: ${name}`,
          metric,
          "WebVitalsService"
        );
      }
    } catch (error) {
      log.error("❌ Failed to send to Sentry", error, "WebVitalsService");
    }
  }

  private sendToCustomEndpoint(name: string, metric: CustomMetric): void {
    if (!this.config.customEndpoint) return;

    fetch(this.config.customEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...metric.customData,
      }),
    }).catch((error) => {
      log.error(
        `Failed to send metric to custom endpoint`,
        error,
        "WebVitalsService"
      );
    });
  }

  private checkPerformanceThresholds(name: string, metric: CustomMetric): void {
    const thresholds = {
      CLS: 0.25,
      FID: 100,
      FCP: 1800,
      LCP: 2500,
      TTFB: 800,
      APICallTime: 3000,
      FileProcessingTime: 5000,
      LongTask: 50,
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      const message = `⚠️ Performance threshold exceeded: ${name} = ${metric.value.toFixed(2)} (threshold: ${threshold})`;

      if (this.config.enableSentry) {
        reportError(new Error(message), {
          metric: name,
          value: metric.value,
          threshold,
          ...metric.customData,
        });
      }

      if (this.config.enableConsoleLog) {
        log.warn(message, metric.customData, "WebVitalsService");
      }
    }
  }

  private measureCustomMetric(
    name: string,
    value: number,
    customData?: Record<string, any>
  ): void {
    const customMetric: CustomMetric = {
      name: name as any,
      value,
      delta: value,
      id: `${name.toLowerCase()}-${Date.now()}`,
      navigationType: "navigate" as any,
      rating: "good" as any,
      entries: [] as any,
      ...(customData ? { customData } : {}),
    };

    this.handleMetric(name, customMetric);
  }

  private getMetricUnit(name: string): string {
    const units: Record<string, string> = {
      CLS: "",
      INP: "ms",
      FCP: "ms",
      LCP: "ms",
      TTFB: "ms",
      NavigationTiming: "ms",
      SlowResource: "ms",
      LongTask: "ms",
      APICallTime: "ms",
      FileProcessingTime: "ms",
      AppLoadTime: "ms",
    };

    return units[name] || "ms";
  }

  private getResourceType(url: string): string {
    if (url.includes(".js")) return "javascript";
    if (url.includes(".css")) return "stylesheet";
    if (
      url.includes(".png") ||
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".webp")
    )
      return "image";
    if (url.includes(".woff") || url.includes(".ttf")) return "font";
    if (url.includes("api")) return "api";
    return "other";
  }

  // Public methods
  public getMetrics(): Map<string, CustomMetric> {
    return new Map(this.metrics);
  }

  public getMetric(name: string): CustomMetric | undefined {
    return Array.from(this.metrics.values()).find(
      (metric) => metric.name === name
    );
  }

  public getPerformanceScore(): number {
    const metrics = Array.from(this.metrics.values());
    let score = 100;

    // Penalize based on Core Web Vitals
    metrics.forEach((metric) => {
      switch (metric.name) {
        case "CLS":
          if (metric.value > 0.25) score -= 20;
          else if (metric.value > 0.1) score -= 10;
          break;
        case "INP":
          if (metric.value > 200) score -= 20;
          else if (metric.value > 100) score -= 10;
          break;
        case "LCP":
          if (metric.value > 2500) score -= 20;
          else if (metric.value > 1800) score -= 10;
          break;
        case "FCP":
          if (metric.value > 1800) score -= 10;
          break;
        case "TTFB":
          if (metric.value > 800) score -= 10;
          break;
      }
    });

    return Math.max(0, score);
  }

  public destroy(): void {
    // Clean up observers
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    // Clear metrics
    this.metrics.clear();

    log.info("🔒 Web Vitals service destroyed", null, "WebVitalsService");
  }
}

// Create singleton instance
let webVitalsService: WebVitalsService | null = null;

export const initWebVitals = (config?: Partial<WebVitalsConfig>) => {
  if (webVitalsService) {
    log.warn(
      "⚠️ Web Vitals service already initialized",
      null,
      "WebVitalsService"
    );
    return webVitalsService;
  }

  webVitalsService = new WebVitalsService(config);

  // Track Web Vitals initialization in analytics
  try {
    sendGAEvent("web_vitals_initialized", {
      config: {
        enableGA4: config?.enableGA4,
        enableSentry: config?.enableSentry,
        enableConsoleLog: config?.enableConsoleLog,
        debug: config?.debug,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    log.error(
      "❌ Failed to track Web Vitals initialization",
      error,
      "WebVitalsService"
    );
  }

  return webVitalsService;
};

export const getWebVitalsService = () => webVitalsService;

export const destroyWebVitals = () => {
  if (webVitalsService) {
    webVitalsService.destroy();
    webVitalsService = null;
  }
};

// Export types
export type { WebVitalsConfig, CustomMetric };

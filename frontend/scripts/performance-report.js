#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function generatePerformanceReport() {
  const reportsDir = path.join(process.cwd(), "reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    bundleAnalysis: {
      target: "250KB compressed",
      status: "pending",
    },
    testCoverage: {
      target: "80%",
      status: "pending",
    },
    webVitals: {
      fcp: { target: "<1.8s", actual: null, status: "pending" },
      lcp: { target: "<2.5s", actual: null, status: "pending" },
      cls: { target: "<0.1", actual: null, status: "pending" },
      fid: { target: "<100ms", actual: null, status: "pending" },
      ttfb: { target: "<600ms", actual: null, status: "pending" },
    },
    e2eTests: {
      status: "pending",
    },
  };

  // Check if coverage report exists
  const coverageFile = path.join(reportsDir, "unit", "coverage-summary.txt");
  if (fs.existsSync(coverageFile)) {
    try {
      const coverageText = fs.readFileSync(coverageFile, "utf8");
      const flat = decodeRecord(coverageText);
      const coverage = unflatten(flat);
      const totalCoverage = coverage.total;

      report.testCoverage.lines = `${totalCoverage.lines.pct}%`;
      report.testCoverage.functions = `${totalCoverage.functions.pct}%`;
      report.testCoverage.branches = `${totalCoverage.branches.pct}%`;
      report.testCoverage.statements = `${totalCoverage.statements.pct}%`;

      const minCoverage = Math.min(
        totalCoverage.lines.pct,
        totalCoverage.functions.pct,
        totalCoverage.branches.pct,
        totalCoverage.statements.pct
      );

      report.testCoverage.status = minCoverage >= 80 ? "passed" : "failed";
    } catch (error) {
      report.testCoverage.status = "error";
    }
  }

  // Check if E2E report exists
  const e2eFile = path.join(reportsDir, "e2e", "results.txt");
  if (fs.existsSync(e2eFile)) {
    try {
      const e2eText = fs.readFileSync(e2eFile, "utf8");
      const flat = decodeRecord(e2eText);
      const e2eResults = unflatten(flat);
      report.e2eTests.passed = e2eResults.stats?.passed || 0;
      report.e2eTests.failed = e2eResults.stats?.failed || 0;
      report.e2eTests.status =
        e2eResults.stats?.failed === 0 ? "passed" : "failed";
    } catch (error) {
      report.e2eTests.status = "error";
    }
  }

  // Check Web Vitals from Sentry or other sources if available
  const webVitalsFile = path.join(reportsDir, "web-vitals.txt");
  if (fs.existsSync(webVitalsFile)) {
    try {
      const vitalsText = fs.readFileSync(webVitalsFile, "utf8");
      const flat = decodeRecord(vitalsText);
      const vitals = unflatten(flat);
      if (vitals.lcp) {
        report.webVitals.lcp.actual = `${(vitals.lcp / 1000).toFixed(2)}s`;
        report.webVitals.lcp.status = vitals.lcp <= 2500 ? "passed" : "failed";
      }
      if (vitals.fcp) {
        report.webVitals.fcp.actual = `${(vitals.fcp / 1000).toFixed(2)}s`;
        report.webVitals.fcp.status = vitals.fcp <= 1800 ? "passed" : "failed";
      }
      if (vitals.cls) {
        report.webVitals.cls.actual = vitals.cls.toFixed(3);
        report.webVitals.cls.status = vitals.cls <= 0.1 ? "passed" : "failed";
      }
      if (vitals.fid) {
        report.webVitals.fid.actual = `${vitals.fid}ms`;
        report.webVitals.fid.status = vitals.fid <= 100 ? "passed" : "failed";
      }
      if (vitals.ttfb) {
        report.webVitals.ttfb.actual = `${vitals.ttfb}ms`;
        report.webVitals.ttfb.status = vitals.ttfb <= 600 ? "passed" : "failed";
      }
    } catch (error) {
      console.warn("Warning: Could not parse Web Vitals data");
    }
  }

  const reportFile = path.join(reportsDir, "performance-report.txt");
  const reportText = encodeRecord(report);
  fs.writeFileSync(reportFile, reportText);

  console.log("📊 Performance Report Generated");
  console.log("==============================");
  console.log(`Report saved to: ${reportFile}`);
  console.log(`Test Coverage: ${report.testCoverage.status}`);
  console.log(`E2E Tests: ${report.e2eTests.status}`);
  console.log(`Bundle Analysis: ${report.bundleAnalysis.status}`);
  console.log("\n📈 Web Vitals:");
  console.log(`  LCP: ${report.webVitals.lcp.actual || 'N/A'} (target: ${report.webVitals.lcp.target})`);
  console.log(`  FCP: ${report.webVitals.fcp.actual || 'N/A'} (target: ${report.webVitals.fcp.target})`);
  console.log(`  CLS: ${report.webVitals.cls.actual || 'N/A'} (target: ${report.webVitals.cls.target})`);
  console.log(`  FID: ${report.webVitals.fid.actual || 'N/A'} (target: ${report.webVitals.fid.target})`);
}

generatePerformanceReport();

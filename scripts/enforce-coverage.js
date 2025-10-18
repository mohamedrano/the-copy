// scripts/enforce-coverage.js
const fs = require('fs');
const path = require('path');

const COVERAGE_SUMMARY_PATH = path.resolve(__dirname, '../coverage/coverage-summary.json');

// Define your package-level thresholds here
const THRESHOLDS = {
  'apps/the-copy': {
    lines: 80,
    branches: 75,
    functions: 80,
    statements: 80,
  },
  // Add other packages/paths as needed
};

function enforceCoverage() {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    console.error(`Error: Coverage summary file not found at ${COVERAGE_SUMMARY_PATH}`);
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf-8'));
  let hasFailed = false;

  for (const packageName in THRESHOLDS) {
    const packageThresholds = THRESHOLDS[packageName];
    const packageSummary = summary[packageName];

    if (!packageSummary) {
      console.warn(`Warning: No coverage data found for package: ${packageName}`);
      continue;
    }

    console.log(`\n--- Enforcing coverage for ${packageName} ---`);
    for (const metric in packageThresholds) {
      const required = packageThresholds[metric];
      const actual = packageSummary[metric].pct;

      if (actual < required) {
        console.error(`  ❌ ${metric}: ${actual}% (below required ${required}%)`);
        hasFailed = true;
      } else {
        console.log(`  ✅ ${metric}: ${actual}% (meets required ${required}%)`);
      }
    }
  }

  if (hasFailed) {
    console.error('\nCoverage enforcement failed: One or more packages did not meet the required thresholds.');
    process.exit(1);
  } else {
    console.log('\nCoverage enforcement passed: All packages meet the required thresholds.');
    process.exit(0);
  }
}

enforceCoverage();

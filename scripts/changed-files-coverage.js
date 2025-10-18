// scripts/changed-files-coverage.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COVERAGE_LCOV_PATH = path.resolve(__dirname, '../coverage/lcov.info');
const REPORTS_DIR = path.resolve(__dirname, '../reports/coverage');

// Define thresholds for changed files
const CHANGED_FILES_THRESHOLDS = {
  lines: 90,
  branches: 85,
  functions: 90,
  statements: 90,
};

function getChangedFiles() {
  // Get files changed in the last commit or against a base branch (e.g., main)
  // For a PR context, you might compare against 'origin/main' or 'HEAD~1'
  const diffOutput = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
  return diffOutput.split('\n').filter(file => file.trim() !== '');
}

function parseLcov(lcovContent) {
  const lines = lcovContent.split('\n');
  const fileCoverage = {};
  let currentFile = null;

  for (const line of lines) {
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3);
      fileCoverage[currentFile] = {
        lines: { found: 0, hit: 0, details: [] },
        functions: { found: 0, hit: 0, details: [] },
        branches: { found: 0, hit: 0, details: [] },
      };
    } else if (currentFile) {
      if (line.startsWith('DA:')) {
        const [, lineNumber, hitCount] = line.match(/DA:(\d+),(\d+)/);
        fileCoverage[currentFile].lines.details.push({ lineNumber: parseInt(lineNumber), hitCount: parseInt(hitCount) });
      } else if (line.startsWith('FN:')) {
        fileCoverage[currentFile].functions.found++;
      } else if (line.startsWith('FNDA:')) {
        const [, hitCount] = line.match(/FNDA:(\d+),/);
        if (parseInt(hitCount) > 0) {
          fileCoverage[currentFile].functions.hit++;
        }
      } else if (line.startsWith('BRDA:')) {
        fileCoverage[currentFile].branches.found++;
      } else if (line.startsWith('BRH:')) {
        const [, hitCount] = line.match(/BRH:(\d+)/);
        fileCoverage[currentFile].branches.hit += parseInt(hitCount);
      } else if (line === 'end_of_record') {
        // Calculate percentages for lines
        const hitLines = fileCoverage[currentFile].lines.details.filter(d => d.hitCount > 0).length;
        const totalLines = fileCoverage[currentFile].lines.details.length;
        fileCoverage[currentFile].lines.pct = totalLines > 0 ? (hitLines / totalLines) * 100 : 100;
        fileCoverage[currentFile].lines.found = totalLines;
        fileCoverage[currentFile].lines.hit = hitLines;

        // Calculate percentages for functions
        fileCoverage[currentFile].functions.pct = fileCoverage[currentFile].functions.found > 0 ? (fileCoverage[currentFile].functions.hit / fileCoverage[currentFile].functions.found) * 100 : 100;

        // Calculate percentages for branches
        fileCoverage[currentFile].branches.pct = fileCoverage[currentFile].branches.found > 0 ? (fileCoverage[currentFile].branches.hit / fileCoverage[currentFile].branches.found) * 100 : 100;

        // Statements are usually lines + branches, for simplicity we'll use lines for now
        fileCoverage[currentFile].statements = {
          pct: fileCoverage[currentFile].lines.pct,
          found: fileCoverage[currentFile].lines.found,
          hit: fileCoverage[currentFile].lines.hit,
        };
        currentFile = null;
      }
    }
  }
  return fileCoverage;
}

function calculateChangedFilesCoverage() {
  console.log('Calculating coverage for changed files...');

  if (!fs.existsSync(COVERAGE_LCOV_PATH)) {
    console.error(`Error: lcov.info file not found at ${COVERAGE_LCOV_PATH}. Please run 'pnpm coverage' first.`);
    process.exit(1);
  }

  const lcovContent = fs.readFileSync(COVERAGE_LCOV_PATH, 'utf-8');
  const allFileCoverage = parseLcov(lcovContent);
  const changedFiles = getChangedFiles();

  const changedFilesCoverage = {};
  let overallChangedLinesHit = 0;
  let overallChangedLinesFound = 0;
  let overallChangedBranchesHit = 0;
  let overallChangedBranchesFound = 0;
  let overallChangedFunctionsHit = 0;
  let overallChangedFunctionsFound = 0;
  let overallChangedStatementsHit = 0;
  let overallChangedStatementsFound = 0;

  for (const file of changedFiles) {
    const absoluteFilePath = path.resolve(process.cwd(), file);
    const relativeFilePath = path.relative(process.cwd(), absoluteFilePath); // Ensure relative path matches lcov

    if (allFileCoverage[relativeFilePath]) {
      const coverage = allFileCoverage[relativeFilePath];
      changedFilesCoverage[relativeFilePath] = coverage;

      overallChangedLinesHit += coverage.lines.hit;
      overallChangedLinesFound += coverage.lines.found;
      overallChangedBranchesHit += coverage.branches.hit;
      overallChangedBranchesFound += coverage.branches.found;
      overallChangedFunctionsHit += coverage.functions.hit;
      overallChangedFunctionsFound += coverage.functions.found;
      overallChangedStatementsHit += coverage.statements.hit;
      overallChangedStatementsFound += coverage.statements.found;
    } else {
      console.warn(`Warning: No coverage data found for changed file: ${relativeFilePath}`);
    }
  }

  const overallLinesPct = overallChangedLinesFound > 0 ? (overallChangedLinesHit / overallChangedLinesFound) * 100 : 100;
  const overallBranchesPct = overallChangedBranchesFound > 0 ? (overallChangedBranchesHit / overallChangedBranchesFound) * 100 : 100;
  const overallFunctionsPct = overallChangedFunctionsFound > 0 ? (overallChangedFunctionsHit / overallChangedFunctionsFound) * 100 : 100;
  const overallStatementsPct = overallChangedStatementsFound > 0 ? (overallChangedStatementsHit / overallChangedStatementsFound) * 100 : 100;

  const overallCoverage = {
    lines: { pct: overallLinesPct, hit: overallChangedLinesHit, found: overallChangedLinesFound },
    branches: { pct: overallBranchesPct, hit: overallChangedBranchesHit, found: overallChangedBranchesFound },
    functions: { pct: overallFunctionsPct, hit: overallChangedFunctionsHit, found: overallChangedFunctionsFound },
    statements: { pct: overallStatementsPct, hit: overallChangedStatementsHit, found: overallChangedStatementsFound },
  };

  console.log('\n--- Overall Coverage for Changed Files ---');
  console.log(`Lines: ${overallCoverage.lines.pct.toFixed(2)}% (Hit: ${overallCoverage.lines.hit}, Found: ${overallCoverage.lines.found})`);
  console.log(`Branches: ${overallCoverage.branches.pct.toFixed(2)}% (Hit: ${overallCoverage.branches.hit}, Found: ${overallCoverage.branches.found})`);
  console.log(`Functions: ${overallCoverage.functions.pct.toFixed(2)}% (Hit: ${overallCoverage.functions.hit}, Found: ${overallCoverage.functions.found})`);
  console.log(`Statements: ${overallCoverage.statements.pct.toFixed(2)}% (Hit: ${overallCoverage.statements.hit}, Found: ${overallCoverage.statements.found})`);

  // Enforce thresholds
  let hasFailed = false;
  for (const metric in CHANGED_FILES_THRESHOLDS) {
    const required = CHANGED_FILES_THRESHOLDS[metric];
    const actual = overallCoverage[metric].pct;

    if (actual < required) {
      console.error(`  ❌ Changed Files ${metric}: ${actual.toFixed(2)}% (below required ${required}%)`);
      hasFailed = true;
    } else {
      console.log(`  ✅ Changed Files ${metric}: ${actual.toFixed(2)}% (meets required ${required}%)`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFileName = `changed-files-${timestamp}.json`;
  const reportPath = path.join(REPORTS_DIR, reportFileName);

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify({ changedFilesCoverage, overallCoverage }, null, 2), 'utf-8');
  console.log(`\nDetailed changed files coverage report saved to: ${reportPath}`);

  if (hasFailed) {
    console.error('\nChanged files coverage enforcement failed: Did not meet the required thresholds.');
    process.exit(1);
  } else {
    console.log('\nChanged files coverage enforcement passed.');
    process.exit(0);
  }
}

calculateChangedFilesCoverage();

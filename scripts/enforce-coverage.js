import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeChangedFilesCoverage } from './changed-files-coverage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COVERAGE_SUMMARY_PATH = path.resolve(__dirname, '..', 'reports', 'coverage', 'latest', 'coverage-summary.json')
const PROJECT_ROOT = path.resolve(__dirname, '..')

const PACKAGE_THRESHOLDS = [
  {
    name: 'core-domain',
    label: 'Core/Domain',
    globs: [
      'src/lib/ai/**',
      'src/utils/**',
      'src/types/**',
    ],
    thresholds: { lines: 90, branches: 85, functions: 85, statements: 90 },
  },
  {
    name: 'services',
    label: 'Services',
    globs: [
      'src/services/AnalysisService.ts',
      'src/services/instructions-loader.ts',
    ],
    thresholds: { lines: 85, branches: 80, functions: 80, statements: 85 },
  },
  {
    name: 'ui-components',
    label: 'UI/Components',
    globs: [
      'src/modules/text/**',
    ],
    thresholds: { lines: 80, branches: 75, functions: 75, statements: 80 },
  },
]

function globToRegExp(globPattern) {
  const escaped = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*')
  return new RegExp(`^${escaped}$`)
}

function normalizePath(filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(PROJECT_ROOT, filePath)
  const relative = path.relative(PROJECT_ROOT, absolute)
  return relative.replace(/\\/g, '/').replace(/^\.\//, '')
}

function loadCoverageSummary() {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    throw new Error(`coverage-summary.json غير موجود عند ${COVERAGE_SUMMARY_PATH}`)
  }
  return JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf8'))
}

function aggregateCoverage(entries) {
  return entries.reduce(
    (acc, entry) => {
      for (const metric of ['lines', 'branches', 'functions', 'statements']) {
        const current = entry[metric]
        if (!current) continue
        acc[metric].covered += current.covered
        acc[metric].total += current.total
      }
      return acc
    },
    {
      lines: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      statements: { covered: 0, total: 0 },
    }
  )
}

function toPct({ covered, total }) {
  return total === 0 ? 100 : (covered / total) * 100
}

function evaluatePackage({ label, globs, thresholds }, coverageEntries) {
  const matchers = globs.map(globToRegExp)
  const matchedEntries = Object.entries(coverageEntries)
    .filter(([key]) => key !== 'total')
    .filter(([key]) => matchers.some((regex) => regex.test(normalizePath(key))))
    .map(([, value]) => value)

  if (matchedEntries.length === 0) {
    return {
      label,
      totals: {
        lines: { pct: 100 },
        branches: { pct: 100 },
        functions: { pct: 100 },
        statements: { pct: 100 },
      },
      failed: [],
    }
  }

  const aggregate = aggregateCoverage(matchedEntries)
  const totals = Object.fromEntries(
    Object.entries(aggregate).map(([metric, data]) => [
      metric,
      {
        covered: data.covered,
        total: data.total,
        pct: toPct(data),
      },
    ])
  )

  const failed = []
  for (const [metric, requirement] of Object.entries(thresholds)) {
    const actual = totals[metric]?.pct ?? 100
    if (actual + 1e-9 < requirement) {
      failed.push({ metric, requirement, actual })
    }
  }

  return { label, totals, failed }
}

function enforcePackageThresholds(summary) {
  const results = PACKAGE_THRESHOLDS.map((config) => evaluatePackage(config, summary))
  let hasFailure = false

  for (const result of results) {
    console.log(`\n${result.label}`)
    for (const [metric, data] of Object.entries(result.totals)) {
      console.log(`  ${metric}: ${data.pct.toFixed(2)}%`)
    }
    if (result.failed.length > 0) {
      hasFailure = true
      for (const failure of result.failed) {
        console.error(
          `❌ ${result.label} أخفقت في ${failure.metric}: ${failure.actual.toFixed(2)}% < ${failure.requirement}%`
        )
      }
    } else {
      console.log('✅ جميع الحدود مستوفاة')
    }
  }

  return { results, hasFailure }
}

async function main() {
  const summary = loadCoverageSummary()
  const { hasFailure } = enforcePackageThresholds(summary)

  const { failedMetrics } = computeChangedFilesCoverage({
    coverageSummaryPath: COVERAGE_SUMMARY_PATH,
    writeReport: false,
  })

  if (failedMetrics.length > 0) {
    for (const failure of failedMetrics) {
      console.error(
        `❌ الملفات المعدلة لم تحقق شرط ${failure.metric}: ${failure.actual.toFixed(2)}% < ${failure.requirement}%`
      )
    }
  }

  if (hasFailure || failedMetrics.length > 0) {
    process.exitCode = 1
  } else {
    console.log('\n✅ جميع بوابات التغطية اجتازت بنجاح')
  }
}

main().catch((error) => {
  console.error('فشل تنفيذ بوابات التغطية:', error)
  process.exit(1)
})

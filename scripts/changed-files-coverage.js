import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPORTS_ROOT = path.resolve(__dirname, '..', 'reports', 'coverage')
const COVERAGE_SUMMARY_PATH = path.resolve(REPORTS_ROOT, 'latest', 'coverage-summary.json')
const PROJECT_ROOT = path.resolve(__dirname, '..')

const DEFAULT_THRESHOLDS = {
  lines: 90,
  branches: 85,
}

function normalizePath(filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(PROJECT_ROOT, filePath)
  const relative = path.relative(PROJECT_ROOT, absolute)
  return relative.replace(/\\/g, '/').replace(/^\.\//, '')
}

function ensureReportsDirectory() {
  fs.mkdirSync(REPORTS_ROOT, { recursive: true })
}

function readCoverageSummary(customPath) {
  const summaryPath = customPath ?? COVERAGE_SUMMARY_PATH
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`لم يتم العثور على ملف التغطية عند المسار: ${summaryPath}`)
  }
  return JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
}

function runGitCommand(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `فشل أمر git ${args.join(' ')}`)
  }
  return result.stdout.trim()
}

function detectBaseRef(explicitBase) {
  if (explicitBase) {
    return explicitBase
  }

  const envBase = process.env.COVERAGE_BASE_REF
  if (envBase) {
    return envBase
  }

  const candidates = ['origin/main', 'origin/master', 'main', 'master']
  for (const candidate of candidates) {
    try {
      runGitCommand(['rev-parse', '--verify', candidate])
      return candidate
    } catch (error) {
      continue
    }
  }

  return 'HEAD~1'
}

function collectChangedFiles(baseRef) {
  let mergeBase = baseRef
  try {
    const commit = runGitCommand(['merge-base', 'HEAD', baseRef])
    mergeBase = commit || baseRef
  } catch (error) {
    // fall back silently
  }

  const diffOutput = runGitCommand(['diff', '--name-only', '--diff-filter=ACMRTUXB', `${mergeBase}...HEAD`])
  return diffOutput
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function aggregateMetrics(entries) {
  return entries.reduce(
    (acc, entry) => {
      const metrics = ['lines', 'branches', 'functions', 'statements']
      for (const metric of metrics) {
        const segment = entry[metric]
        if (!segment) continue
        acc[metric].covered += segment.covered
        acc[metric].total += segment.total
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

function toPercentage({ covered, total }) {
  return total === 0 ? 100 : (covered / total) * 100
}

export function computeChangedFilesCoverage({
  coverageSummaryPath,
  baseRef,
  thresholds = DEFAULT_THRESHOLDS,
  writeReport = true,
} = {}) {
  ensureReportsDirectory()
  const summary = readCoverageSummary(coverageSummaryPath)
  const resolvedBase = detectBaseRef(baseRef)
  const changedFiles = collectChangedFiles(resolvedBase)

  const perFile = []
  for (const filePath of changedFiles) {
    const normalized = normalizePath(filePath)
    if (!summary[normalized]) {
      continue
    }
    perFile.push({
      file: normalized,
      metrics: summary[normalized],
    })
  }

  const aggregate = aggregateMetrics(perFile.map((entry) => entry.metrics))
  const totals = Object.fromEntries(
    Object.entries(aggregate).map(([metric, data]) => [
      metric,
      {
        covered: data.covered,
        total: data.total,
        pct: toPercentage(data),
      },
    ])
  )

  const evaluation = {
    baseRef: resolvedBase,
    changedFileCount: perFile.length,
    thresholds,
    totals,
    perFile,
  }

  if (writeReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = path.join(REPORTS_ROOT, `changed-files-${timestamp}.json`)
    fs.writeFileSync(filename, JSON.stringify(evaluation, null, 2))
    console.log(`تم إنشاء تقرير تغطية الملفات المعدلة: ${filename}`)
  }

  const failedMetrics = []
  for (const [metric, requirement] of Object.entries(thresholds)) {
    const actual = totals[metric]?.pct ?? 100
    if (actual + 1e-9 < requirement) {
      failedMetrics.push({ metric, requirement, actual })
    }
  }

  return { evaluation, failedMetrics }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const baseIndex = process.argv.indexOf('--base')
    const baseRef = baseIndex !== -1 ? process.argv[baseIndex + 1] : undefined
    const { failedMetrics } = computeChangedFilesCoverage({ baseRef })
    if (failedMetrics.length > 0) {
      console.error('فشلت تغطية الملفات المعدلة:', failedMetrics)
      process.exit(1)
    }
  } catch (error) {
    console.error('تعذر حساب تغطية الملفات المعدلة:', error)
    process.exit(1)
  }
}

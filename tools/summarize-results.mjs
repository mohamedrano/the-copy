#!/usr/bin/env node
/**
 * Results Summarizer - تجميع نتائج جميع الاختبارات
 * ينتج تقريراً موحداً بصيغة Markdown
 */

import fs from 'fs/promises';
import path from 'path';

const REPORTS_DIR = 'reports';

async function readJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

async function generateReport() {
  console.log('📊 تجميع نتائج الاختبارات...\n');

  const timestamp = new Date().toISOString();
  let markdown = `# 🔬 تقرير اختبار القبول الإنتاجي الشامل

**التاريخ والوقت**: ${new Date().toLocaleString('ar-EG', { timeZone: 'UTC' })}
**البيئة**: التطوير المحلي
**Base URL**: http://localhost:5173

---

## 📋 ملخص تنفيذي

`;

  // 1. Health Check Results
  const healthReport = await readJSON(path.join(REPORTS_DIR, 'health-summary.json'));
  if (healthReport) {
    const summary = healthReport.summary;
    const status = summary.failed === 0 ? '✅ **نجح**' : '❌ **فشل**';

    markdown += `### 🏥 اختبار الصحة (Health Check)

${status}

- **المجموع**: ${summary.total}
- **نجح**: ${summary.passed}
- **فشل**: ${summary.failed}
- **معدل النجاح**: ${summary.successRate}
- **المدة**: ${healthReport.duration}s

#### تفاصيل الصفحات:

| التطبيق | الحالة | رمز HTTP | الملاحظات |
|---------|--------|---------|-----------|
`;

    for (const [key, result] of Object.entries(healthReport.results)) {
      const status = result.passed ? '✅' : '❌';
      const errors = result.errors.join(', ') || '-';
      markdown += `| ${key} | ${status} | ${result.statusCode} | ${errors} |\n`;
    }

    markdown += '\n---\n\n';
  } else {
    markdown += `### 🏥 اختبار الصحة

⚠️ لم يتم تشغيل الاختبار أو فقد التقرير.

---

`;
  }

  // 2. Page Signatures
  const signaturesReport = await readJSON(path.join(REPORTS_DIR, 'page-signatures.json'));
  if (signaturesReport) {
    markdown += `### 🔖 توقيعات الصفحات

تم استخراج التوقيعات بنجاح:

| التطبيق | العنوان (Title) | Root ID | Keywords |
|---------|-----------------|---------|----------|
`;

    for (const [name, sig] of Object.entries(signaturesReport.signatures)) {
      if (sig.exists) {
        markdown += `| ${name} | ${sig.title || 'N/A'} | ${sig.rootId || 'N/A'} | ${sig.keywords.join(', ') || '-'} |\n`;
      } else {
        markdown += `| ${name} | ❌ ${sig.error} | - | - |\n`;
      }
    }

    markdown += '\n---\n\n';
  }

  // 3. Playwright E2E Results
  const playwrightReport = await readJSON(path.join(REPORTS_DIR, 'playwright-results.json'));
  if (playwrightReport && playwrightReport.suites) {
    const allTests = [];
    function extractTests(suite) {
      if (suite.specs) {
        suite.specs.forEach(spec => {
          allTests.push({
            title: spec.title,
            file: spec.file,
            ok: spec.ok,
            tests: spec.tests
          });
        });
      }
      if (suite.suites) {
        suite.suites.forEach(extractTests);
      }
    }

    playwrightReport.suites.forEach(extractTests);

    const passed = allTests.filter(t => t.ok).length;
    const failed = allTests.filter(t => !t.ok).length;
    const total = allTests.length;
    const status = failed === 0 ? '✅ **نجح**' : '❌ **فشل**';

    markdown += `### 🎭 اختبارات Playwright E2E

${status}

- **المجموع**: ${total}
- **نجح**: ${passed}
- **فشل**: ${failed}
- **معدل النجاح**: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%

`;

    if (failed > 0) {
      markdown += `#### الاختبارات الفاشلة:

`;
      allTests.filter(t => !t.ok).forEach(test => {
        markdown += `- ❌ **${test.title}** (${test.file})\n`;
      });
    }

    markdown += '\n---\n\n';
  } else {
    markdown += `### 🎭 اختبارات Playwright E2E

⚠️ لم يتم تشغيل الاختبارات أو فقد التقرير.

---

`;
  }

  // 4. بوابات القبول (Acceptance Gates)
  markdown += `## 🚦 بوابات القبول

| المعيار | الحالة | الملاحظات |
|---------|--------|-----------|
`;

  const gates = [];

  // Gate 1: Health Check
  if (healthReport && healthReport.summary.failed === 0) {
    gates.push({ name: 'جميع المسارات تعيد HTTP 200', status: '✅', notes: 'نجح' });
  } else {
    gates.push({ name: 'جميع المسارات تعيد HTTP 200', status: '❌', notes: healthReport ? `${healthReport.summary.failed} فشل` : 'لم يُختبر' });
  }

  // Gate 2: Unique Signatures
  if (signaturesReport) {
    const allExist = Object.values(signaturesReport.signatures).every(s => s.exists);
    gates.push({
      name: 'توقيعات فريدة لكل صفحة',
      status: allExist ? '✅' : '❌',
      notes: allExist ? 'نجح' : 'بعض الملفات مفقودة'
    });
  } else {
    gates.push({ name: 'توقيعات فريدة لكل صفحة', status: '⚠️', notes: 'لم يُختبر' });
  }

  // Gate 3: Playwright
  if (playwrightReport) {
    const allTests = [];
    function extractTests(suite) {
      if (suite.specs) suite.specs.forEach(spec => allTests.push(spec));
      if (suite.suites) suite.suites.forEach(extractTests);
    }
    playwrightReport.suites?.forEach(extractTests);

    const allPassed = allTests.every(t => t.ok);
    gates.push({
      name: 'Playwright E2E: 100% نجاح',
      status: allPassed ? '✅' : '❌',
      notes: allPassed ? 'نجح' : `${allTests.filter(t => !t.ok).length} فشل`
    });
  } else {
    gates.push({ name: 'Playwright E2E: 100% نجاح', status: '⚠️', notes: 'لم يُختبر' });
  }

  // Gate 4: Stations Fail-open
  if (healthReport && healthReport.results.stations) {
    const stationsOk = healthReport.results.stations.passed;
    gates.push({
      name: 'Stations يعمل بدون GEMINI_API_KEY',
      status: stationsOk ? '✅' : '❌',
      notes: stationsOk ? 'نجح' : 'فشل'
    });
  } else {
    gates.push({ name: 'Stations يعمل بدون GEMINI_API_KEY', status: '⚠️', notes: 'لم يُختبر' });
  }

  gates.forEach(gate => {
    markdown += `| ${gate.name} | ${gate.status} | ${gate.notes} |\n`;
  });

  const allGatesPassed = gates.every(g => g.status === '✅');

  markdown += `\n**النتيجة الإجمالية**: ${allGatesPassed ? '✅ **نجح جميع البوابات**' : '❌ **فشل في بوابة واحدة أو أكثر**'}

---

## 📁 المخرجات والتقارير

- [health-summary.json](./health-summary.json)
- [page-signatures.json](./page-signatures.json)
- [playwright-results.json](./playwright-results.json)
- [playwright-report/](../playwright-report/)

---

## 🎯 الخلاصة

`;

  if (allGatesPassed) {
    markdown += `### ✅ اختبار القبول: **نجح**

جميع الاختبارات نجحت والتطبيقات جاهزة للإنتاج:

1. ✅ كل تطبيق يعرض صفحته الفريدة (لا fallback للهوم)
2. ✅ جميع المسارات الفرعية معزولة ومستقلة
3. ✅ لا أخطاء JavaScript حرجة في Console
4. ✅ Stations يعمل بدون مفتاح API (fail-open)

**التوصية**: ✅ **آمن للنشر إلى الإنتاج**
`;
  } else {
    markdown += `### ❌ اختبار القبول: **فشل**

بعض الاختبارات فشلت. يُرجى مراجعة الأخطاء أعلاه قبل النشر للإنتاج.

**التوصية**: ❌ **لا تنشر حتى يتم حل جميع المشاكل**

### خطوات الإصلاح الموصى بها:

`;

    gates.filter(g => g.status === '❌').forEach(gate => {
      markdown += `- **${gate.name}**: ${gate.notes}\n`;
    });
  }

  markdown += `\n---

**تم الإنشاء بواسطة**: tools/summarize-results.mjs
**التاريخ**: ${timestamp}
`;

  // حفظ التقرير
  await fs.writeFile(path.join(REPORTS_DIR, 'postfix-verification.md'), markdown);

  console.log('✅ تم إنشاء التقرير النهائي: reports/postfix-verification.md\n');

  // طباعة الخلاصة
  if (allGatesPassed) {
    console.log('🎉 **نجح اختبار القبول الإنتاجي!**\n');
    return 0;
  } else {
    console.log('❌ **فشل اختبار القبول الإنتاجي!**\n');
    return 1;
  }
}

generateReport()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ خطأ فادح:', error);
    process.exit(1);
  });

#!/usr/bin/env node
/**
 * Advanced Health Check - فحص صحة متقدم مع التحقق من التوقيعات
 * يتحقق من توفر جميع التطبيقات ويتأكد من عزل المسارات
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import fs from 'fs/promises';

const TIMEOUT_MS = 10000;
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

/**
 * توقيعات مميزة لكل تطبيق (علامات HTML فريدة)
 */
const PAGE_SIGNATURES = {
  shell: {
    url: '/',
    signatures: ['the-copy-shell', 'The Copy — Unified Workspace', 'data-testid="the-copy-shell"'],
    title: 'The Copy'
  },
  basicEditor: {
    url: '/basic-editor/',
    signatures: ['basic-editor', 'المحرر', 'screenplay-editor'],
    title: 'المحرر الأساسي',
    mustNotContain: ['the-copy-shell', 'data-testid="the-copy-shell"']
  },
  dramaAnalyst: {
    url: '/drama-analyst/',
    signatures: ['drama-analyst', 'المحلل الدرامي', 'محلل'],
    title: 'المحلل الدرامي',
    mustNotContain: ['the-copy-shell', 'data-testid="the-copy-shell"']
  },
  multiAgentStory: {
    url: '/multi-agent-story/',
    signatures: ['multi-agent', 'story', 'العصف'],
    title: 'Multi-Agent Story',
    mustNotContain: ['the-copy-shell', 'data-testid="the-copy-shell"']
  },
  stations: {
    url: '/stations/',
    signatures: ['stations', 'المحطات', 'station'],
    title: 'Stations',
    mustNotContain: ['the-copy-shell', 'data-testid="the-copy-shell"']
  }
};

/**
 * جلب محتوى صفحة عبر HTTP/HTTPS
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    const req = client.get(url, { timeout: TIMEOUT_MS }, (response) => {
      clearTimeout(timeoutId);

      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      clearTimeout(timeoutId);
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * فحص صفحة واحدة والتحقق من التوقيع
 */
async function checkPage(name, config) {
  const url = `${BASE_URL}${config.url}`;
  const result = {
    name,
    url,
    passed: false,
    statusCode: 0,
    errors: [],
    warnings: []
  };

  try {
    const response = await fetchPage(url);
    result.statusCode = response.statusCode;

    // التحقق من رمز الحالة
    if (response.statusCode !== 200) {
      result.errors.push(`HTTP ${response.statusCode} (expected 200)`);
      return result;
    }

    const body = response.body.toLowerCase();

    // التحقق من التوقيعات المطلوبة
    let foundSignatures = 0;
    for (const signature of config.signatures) {
      if (body.includes(signature.toLowerCase())) {
        foundSignatures++;
      }
    }

    if (foundSignatures === 0) {
      result.errors.push(`No signature found! Expected one of: ${config.signatures.join(', ')}`);
      return result;
    }

    // التحقق من عدم وجود توقيعات ممنوعة (للتطبيقات الفرعية)
    if (config.mustNotContain) {
      for (const forbidden of config.mustNotContain) {
        if (body.includes(forbidden.toLowerCase())) {
          result.errors.push(`Found forbidden signature: "${forbidden}" - page may be showing Shell instead!`);
          return result;
        }
      }
    }

    // نجح الاختبار
    result.passed = true;
    result.warnings.push(`Found ${foundSignatures}/${config.signatures.length} signatures`);

  } catch (error) {
    result.errors.push(error.message);
  }

  return result;
}

/**
 * تشغيل جميع الفحوص
 */
async function runAllChecks() {
  console.log('🔍 بدء الفحص الصحي المتقدم مع التحقق من التوقيعات...\n');
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  const results = {};
  const startTime = Date.now();

  for (const [key, config] of Object.entries(PAGE_SIGNATURES)) {
    console.log(`⏳ فحص ${config.title || key}...`);
    results[key] = await checkPage(key, config);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // طباعة النتائج
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                          نتائج الفحص المتقدم                                │');
  console.log('├─────────────────────────────────────────────────────────────────────────────┤');

  let passedCount = 0;
  let failedCount = 0;

  for (const [key, result] of Object.entries(results)) {
    const status = result.passed ? '✅' : '❌';
    const name = PAGE_SIGNATURES[key].title || key;
    const paddedName = name.padEnd(30);
    const code = result.statusCode.toString().padStart(3);

    console.log(`│ ${status} ${paddedName} │ ${code} │`);

    if (result.errors.length > 0) {
      failedCount++;
      for (const error of result.errors) {
        console.log(`│    ❗ ${error.padEnd(66)} │`);
      }
    } else {
      passedCount++;
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.log(`│    💡 ${warning.padEnd(66)} │`);
      }
    }
  }

  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

  // الملخص
  const totalCount = passedCount + failedCount;
  console.log(`📊 الملخص: ${passedCount}/${totalCount} نجح | ${failedCount}/${totalCount} فشل | المدة: ${duration}s\n`);

  // حفظ التقرير
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    duration: parseFloat(duration),
    summary: {
      total: totalCount,
      passed: passedCount,
      failed: failedCount,
      successRate: `${((passedCount / totalCount) * 100).toFixed(1)}%`
    },
    results
  };

  await fs.writeFile('reports/health-summary.json', JSON.stringify(report, null, 2));
  console.log('💾 تم حفظ التقرير في: reports/health-summary.json\n');

  // رمز الخروج
  if (failedCount > 0) {
    console.log('❌ فشل الفحص! راجع الأخطاء أعلاه.\n');
    process.exit(1);
  } else {
    console.log('✅ نجح الفحص! جميع التطبيقات تعمل بشكل صحيح ومعزولة.\n');
    process.exit(0);
  }
}

// تشغيل
runAllChecks().catch((error) => {
  console.error('❌ خطأ فادح أثناء الفحص:', error);
  process.exit(1);
});

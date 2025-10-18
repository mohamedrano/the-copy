#!/usr/bin/env node
/**
 * Health Check Tool - اختبار صحة التطبيقات
 * يتحقق من توفر جميع التطبيقات الفرعية على المنافذ المحددة
 */

import http from 'http';

const TIMEOUT_MS = 5000;

const endpoints = [
  { name: 'Shell (The Copy)', url: 'http://localhost:5173/' },
  { name: 'Basic Editor', url: 'http://localhost:5173/basic-editor/' },
  { name: 'Drama Analyst', url: 'http://localhost:5173/drama-analyst/' },
  { name: 'Multi-Agent Story', url: 'http://localhost:5173/multi-agent-story/' },
  { name: 'Stations', url: 'http://localhost:5173/stations/' },
];

/**
 * فحص نقطة نهاية واحدة
 * @param {string} url - العنوان المراد فحصه
 * @param {string} name - اسم التطبيق
 * @returns {Promise<{name: string, url: string, ok: boolean, code: number, message: string}>}
 */
function checkEndpoint(url, name) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        name,
        url,
        ok: false,
        code: 0,
        message: `Timeout after ${TIMEOUT_MS}ms`
      });
    }, TIMEOUT_MS);

    http.get(url, (response) => {
      clearTimeout(timeoutId);
      const ok = response.statusCode >= 200 && response.statusCode < 400;
      resolve({
        name,
        url,
        ok,
        code: response.statusCode,
        message: ok ? 'OK' : `HTTP ${response.statusCode}`
      });
    }).on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        name,
        url,
        ok: false,
        code: 0,
        message: error.code || error.message || 'Unknown error'
      });
    });
  });
}

/**
 * تشغيل كل الفحوص
 */
async function runHealthCheck() {
  console.log('🔍 بدء فحص صحة التطبيقات...\n');

  const results = await Promise.all(
    endpoints.map(({ name, url }) => checkEndpoint(url, name))
  );

  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│                        نتائج الفحص                              │');
  console.log('├─────────────────────────────────────────────────────────────────┤');

  results.forEach((result) => {
    const status = result.ok ? '✅' : '❌';
    const paddedName = result.name.padEnd(25);
    const paddedCode = result.code.toString().padStart(3);
    const paddedMessage = result.message.padEnd(25);

    console.log(`│ ${status} ${paddedName} │ ${paddedCode} │ ${paddedMessage} │`);
  });

  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  const allOk = results.every((r) => r.ok);
  const successCount = results.filter((r) => r.ok).length;
  const totalCount = results.length;

  if (allOk) {
    console.log(`✅ نجح الفحص! جميع التطبيقات (${successCount}/${totalCount}) تعمل بشكل صحيح.\n`);
    process.exit(0);
  } else {
    console.log(`❌ فشل الفحص! (${successCount}/${totalCount}) تطبيقات تعمل.\n`);
    console.log('💡 تأكد من تشغيل جميع التطبيقات باستخدام: pnpm run dev:all\n');
    process.exit(1);
  }
}

// تشغيل الفحص
runHealthCheck().catch((error) => {
  console.error('❌ خطأ أثناء تشغيل فحص الصحة:', error);
  process.exit(1);
});

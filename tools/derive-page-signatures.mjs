#!/usr/bin/env node
/**
 * Page Signatures Derivation
 * استخراج التوقيعات الفعلية من ملفات index.html لكل تطبيق
 */

import fs from 'fs/promises';
import path from 'path';

const APPS = [
  { name: 'Shell', path: 'apps/the-copy/index.html', expectedBase: '/' },
  { name: 'Basic Editor', path: 'apps/basic-editor/index.html', expectedBase: '/basic-editor/' },
  { name: 'Drama Analyst', path: 'apps/drama-analyst/index.html', expectedBase: '/drama-analyst/' },
  { name: 'Multi-Agent Story', path: 'apps/multi-agent-story/index.html', expectedBase: '/multi-agent-story/' },
  { name: 'Stations', path: 'apps/stations/index.html', expectedBase: '/stations/' }
];

/**
 * استخراج التوقيع من ملف HTML
 */
async function extractSignature(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // استخراج <title>
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // استخراج id من root div
    const rootIdMatch = content.match(/id=["']([^"']+)["']/);
    const rootId = rootIdMatch ? rootIdMatch[1] : null;

    // استخراج data-testid
    const testIdMatch = content.match(/data-testid=["']([^"']+)["']/);
    const testId = testIdMatch ? testIdMatch[1] : null;

    // البحث عن كلمات مفتاحية مميزة
    const keywords = [];
    if (content.includes('screenplay')) keywords.push('screenplay');
    if (content.includes('drama')) keywords.push('drama');
    if (content.includes('analyst')) keywords.push('analyst');
    if (content.includes('station')) keywords.push('station');
    if (content.includes('agent')) keywords.push('agent');
    if (content.includes('story')) keywords.push('story');
    if (content.includes('محرر')) keywords.push('محرر');
    if (content.includes('محلل')) keywords.push('محلل');
    if (content.includes('محطات')) keywords.push('محطات');

    return {
      title,
      rootId,
      testId,
      keywords: [...new Set(keywords)],
      exists: true
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { exists: false, error: 'File not found' };
    }
    return { exists: false, error: error.message };
  }
}

/**
 * التشغيل الرئيسي
 */
async function main() {
  console.log('🔍 استخراج توقيعات الصفحات من ملفات HTML...\n');

  const signatures = {};

  for (const app of APPS) {
    console.log(`⏳ معالجة ${app.name}...`);
    const signature = await extractSignature(app.path);
    signatures[app.name] = {
      ...signature,
      path: app.path,
      expectedBase: app.expectedBase
    };
  }

  // طباعة النتائج
  console.log('\n┌──────────────────────────────────────────────────────────────┐');
  console.log('│                     التوقيعات المستخرجة                     │');
  console.log('├──────────────────────────────────────────────────────────────┤');

  for (const [name, sig] of Object.entries(signatures)) {
    console.log(`│ ${name.padEnd(58)} │`);
    if (sig.exists) {
      console.log(`│   Title: ${(sig.title || 'N/A').padEnd(50)} │`);
      console.log(`│   Root ID: ${(sig.rootId || 'N/A').padEnd(48)} │`);
      console.log(`│   Test ID: ${(sig.testId || 'N/A').padEnd(48)} │`);
      console.log(`│   Keywords: ${sig.keywords.join(', ').padEnd(47)} │`);
    } else {
      console.log(`│   ❌ ${sig.error.padEnd(54)} │`);
    }
    console.log('├──────────────────────────────────────────────────────────────┤');
  }

  console.log('└──────────────────────────────────────────────────────────────┘\n');

  // حفظ النتائج
  const report = {
    timestamp: new Date().toISOString(),
    signatures
  };

  await fs.writeFile('reports/page-signatures.json', JSON.stringify(report, null, 2));
  console.log('💾 تم حفظ التقرير في: reports/page-signatures.json\n');

  // التحقق من الفرادة
  const titles = Object.values(signatures).map(s => s.title).filter(Boolean);
  const uniqueTitles = new Set(titles);

  if (titles.length !== uniqueTitles.size) {
    console.log('⚠️  تحذير: بعض التطبيقات لها نفس العنوان!\n');
  } else {
    console.log('✅ جميع العناوين فريدة ومميزة.\n');
  }
}

main().catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});

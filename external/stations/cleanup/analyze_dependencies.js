import fs from 'fs';

// قراءة ملف الاعتماديات
const depsData = JSON.parse(fs.readFileSync('deps.json', 'utf8'));

// قائمة بجميع الملفات الموجودة
const allFiles = [
  'server/analysis_modules/efficiency-metrics.ts',
  'server/analysis_modules/network-diagnostics.ts',
  'server/core/models/base-entities.ts',
  'server/core/pipeline/base-station.ts',
  'server/index.ts',
  'server/middleware/auth.ts',
  'server/middleware/rate-limit.ts',
  'server/middleware/sanitize.ts',
  'server/routes.ts',
  'server/routes/health.ts',
  'server/run-all-stations.ts',
  'server/services/ai/gemini-service.ts',
  'server/services/ai/result-selector.ts',
  'server/stations/station1/station1-text-analysis.ts',
  'server/stations/station2/station2-conceptual-analysis.ts',
  'server/stations/station3/station3-network-builder.ts',
  'server/stations/station4/station4-efficiency-metrics.ts',
  'server/stations/station5/station5-dynamic-symbolic-stylistic.ts',
  'server/stations/station6/station6-diagnostics-treatment.ts',
  'server/stations/station7/station7-finalization.ts',
  'server/storage.ts',
  'server/types/contexts.ts',
  'server/utils/logger.ts',
  'server/vite.ts',
  'shared/schema.ts',
  'src/App.tsx',
  'src/components/__tests__/station-progress-utils.test.ts',
  'src/components/AnalysisCard.tsx',
  'src/components/CharacterNode.tsx',
  'src/components/ConflictNetwork.tsx',
  'src/components/DiagnosticPanel.tsx',
  'src/components/Header.tsx',
  'src/components/HeroSection.tsx',
  'src/components/MetricCard.tsx',
  'src/components/station-progress-utils.ts',
  'src/components/StationProgress.tsx',
  'src/components/TextInput.tsx',
  'src/contexts/LanguageContext.tsx',
  'src/contexts/ThemeContext.tsx',
  'src/hooks/use-mobile.tsx',
  'src/hooks/use-toast.ts',
  'src/lib/queryClient.ts',
  'src/lib/utils.ts',
  'src/main.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/not-found.tsx'
];

// إنشاء مجموعة من الملفات المستخدمة
const usedFiles = new Set();
Object.keys(depsData).forEach(file => {
  usedFiles.add(file);
  depsData[file].forEach(dep => {
    usedFiles.add(dep);
  });
});

// العثور على الملفات غير المستخدمة
const unusedFiles = allFiles.filter(file => !usedFiles.has(file));

// eslint-disable-next-line no-console
console.log('=== تحليل الاعتماديات ===\n');
// eslint-disable-next-line no-console
console.log('الملفات غير المستخدمة (unused):');
unusedFiles.forEach(file => {
  // eslint-disable-next-line no-console
  console.log(`  - ${file}`);
});

// حفظ التقرير
const report = {
  timestamp: new Date().toISOString(),
  totalFiles: allFiles.length,
  usedFiles: usedFiles.size,
  unusedFiles: unusedFiles.length,
  unusedFilesList: unusedFiles
};

fs.writeFileSync('cleanup/analysis_report.json', JSON.stringify(report, null, 2));
// eslint-disable-next-line no-console
console.log('\n=== تم حفظ التقرير في cleanup/analysis_report.json ===');
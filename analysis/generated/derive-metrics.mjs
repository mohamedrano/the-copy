import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(new URL('.', import.meta.url).pathname, '..', '..');
const analysisPath = path.join(projectRoot, 'analysis', 'generated', 'static-analysis.json');
const data = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
const modules = data.modules ?? [];

const entryPoints = new Set([
  'src/main.tsx',
]);

const testDirectories = ['src/tests', 'tests'];
const isTestFile = (modulePath) => testDirectories.some((dir) => modulePath.startsWith(`${dir}/`) || modulePath === dir);

const inactiveModules = modules.filter((module) => {
  if (entryPoints.has(module.path)) {
    return false;
  }
  if (isTestFile(module.path)) {
    return false;
  }
  return module.importedByCount === 0;
});

const unusedExports = [];
for (const module of modules) {
  if (!module.exports) continue;
  for (const exported of module.exports) {
    if (exported.isTypeOnly) {
      continue;
    }
    const usageCount = module.exportUsage?.[exported.name] ?? 0;
    if (usageCount === 0) {
      unusedExports.push({
        module: module.path,
        exportName: exported.name,
      });
    }
  }
}

const exactDuplicateGroups = new Map();
for (const module of modules) {
  if (!module.sha256) continue;
  if (!exactDuplicateGroups.has(module.sha256)) {
    exactDuplicateGroups.set(module.sha256, []);
  }
  exactDuplicateGroups.get(module.sha256).push(module.path);
}
const exactDuplicates = Array.from(exactDuplicateGroups.values()).filter((group) => group.length > 1);

const structuralGroups = new Map();
for (const module of modules) {
  if (!module.structureHash) continue;
  if (!structuralGroups.has(module.structureHash)) {
    structuralGroups.set(module.structureHash, []);
  }
  structuralGroups.get(module.structureHash).push(module.path);
}
const structuralDuplicates = Array.from(structuralGroups.entries())
  .filter(([_, group]) => group.length > 1)
  .map(([hash, group]) => ({ hash, members: group }))
  .filter((entry) => {
    const members = entry.members;
    if (members.length <= 1) return false;
    const firstSha = modules.find((m) => m.path === members[0])?.sha256;
    return members.some((member) => modules.find((m) => m.path === member)?.sha256 !== firstSha);
  });

const summary = {
  totals: {
    totalModules: modules.length,
    inactiveModuleCount: inactiveModules.length,
    unusedExportCount: unusedExports.length,
    exactDuplicateGroupCount: exactDuplicates.length,
    structuralDuplicateGroupCount: structuralDuplicates.length,
  },
  inactiveModules,
  unusedExports,
  exactDuplicates,
  structuralDuplicates,
};

const outputPath = path.join(projectRoot, 'analysis', 'generated', 'static-summary.json');
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
console.log(`Wrote summary to ${path.relative(projectRoot, outputPath)}`);

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ts from 'typescript';

const projectRoot = path.resolve(new URL('.', import.meta.url).pathname, '..', '..');
const srcDir = path.join(projectRoot, 'src');

const normalizePath = (filePath) => filePath.split(path.sep).join('/');
const toRelative = (filePath) => normalizePath(path.relative(projectRoot, filePath));

const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  throw new Error('tsconfig.json not found');
}
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  throw new Error('Failed to read tsconfig.json');
}
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
const compilerOptions = parsedConfig.options;
const program = ts.createProgram({ rootNames: parsedConfig.fileNames, options: compilerOptions });
const checker = program.getTypeChecker();

const moduleInfo = new Map();

const ensureModule = (filePath) => {
  const absPath = path.resolve(filePath);
  const key = toRelative(absPath);
  if (!moduleInfo.has(key)) {
    moduleInfo.set(key, {
      path: key,
      imports: new Set(),
      importedBy: new Set(),
      exports: new Map(),
      exportUsage: new Map(),
      sha256: '',
      structureHash: '',
      sizeBytes: 0,
      lastModifiedMs: 0,
    });
  }
  return moduleInfo.get(key);
};

const sourceFiles = program.getSourceFiles().filter((sourceFile) => {
  const fileName = normalizePath(sourceFile.fileName);
  return fileName.startsWith(normalizePath(srcDir)) && !fileName.endsWith('.d.ts');
});

for (const sourceFile of sourceFiles) {
  const info = ensureModule(sourceFile.fileName);
  const fileContent = ts.sys.readFile(sourceFile.fileName) ?? '';
  info.sha256 = crypto.createHash('sha256').update(fileContent).digest('hex');
  info.sizeBytes = Buffer.byteLength(fileContent);
  try {
    const stats = fs.statSync(sourceFile.fileName);
    info.lastModifiedMs = stats.mtimeMs;
  } catch {
    info.lastModifiedMs = 0;
  }

  const structureHasher = crypto.createHash('sha256');
  const visited = new Set();
  const walk = (node) => {
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    structureHasher.update(`${ts.SyntaxKind[node.kind]}:`);
    node.forEachChild((child) => walk(child));
    structureHasher.update(';');
  };
  walk(sourceFile);
  info.structureHash = structureHasher.digest('hex');

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (moduleSymbol) {
    for (const exportSymbol of checker.getExportsOfModule(moduleSymbol)) {
      const exportName = exportSymbol.getName();
      const flags = ts.SymbolFlags;
      const isType = (exportSymbol.getFlags() & (flags.Type | flags.Interface | flags.TypeAlias)) !== 0 &&
        (exportSymbol.getFlags() & flags.Value) === 0;
      info.exports.set(exportName, {
        name: exportName,
        isTypeOnly: isType,
      });
      info.exportUsage.set(exportName, 0);
    }
  }
}

const recordImportUsage = (toFile, importedName) => {
  const targetInfo = moduleInfo.get(toFile);
  if (!targetInfo) {
    return;
  }
  const usageKey = importedName ?? '*';
  if (!targetInfo.exportUsage.has(usageKey)) {
    targetInfo.exportUsage.set(usageKey, 0);
  }
  targetInfo.exportUsage.set(usageKey, (targetInfo.exportUsage.get(usageKey) ?? 0) + 1);
};

for (const sourceFile of sourceFiles) {
  const info = ensureModule(sourceFile.fileName);
  const resolveSpecifier = (specifier) => {
    const { resolvedModule } = ts.resolveModuleName(specifier, sourceFile.fileName, compilerOptions, ts.sys);
    if (!resolvedModule || resolvedModule.isExternalLibraryImport) {
      return null;
    }
    const resolvedFile = path.resolve(resolvedModule.resolvedFileName);
    if (!normalizePath(resolvedFile).startsWith(normalizePath(srcDir))) {
      return null;
    }
    return toRelative(resolvedFile);
  };

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      const resolved = resolveSpecifier(specifier);
      if (!resolved) {
        continue;
      }
      const targetInfo = ensureModule(path.join(projectRoot, resolved));
      info.imports.add(targetInfo.path);
      targetInfo.importedBy.add(info.path);
      if (statement.importClause) {
        if (statement.importClause.name) {
          recordImportUsage(targetInfo.path, 'default');
        }
        if (statement.importClause.namedBindings) {
          if (ts.isNamespaceImport(statement.importClause.namedBindings)) {
            recordImportUsage(targetInfo.path, '*');
          } else if (ts.isNamedImports(statement.importClause.namedBindings)) {
            for (const element of statement.importClause.namedBindings.elements) {
              const importName = element.propertyName ? element.propertyName.text : element.name.text;
              recordImportUsage(targetInfo.path, importName);
            }
          }
        }
      } else {
        recordImportUsage(targetInfo.path, '*');
      }
    } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      const resolved = resolveSpecifier(specifier);
      if (!resolved) {
        continue;
      }
      const targetInfo = ensureModule(path.join(projectRoot, resolved));
      info.imports.add(targetInfo.path);
      targetInfo.importedBy.add(info.path);
      const exportClause = statement.exportClause;
      if (exportClause && ts.isNamedExports(exportClause)) {
        for (const element of exportClause.elements) {
          const name = element.propertyName ? element.propertyName.text : element.name.text;
          recordImportUsage(targetInfo.path, name);
        }
      } else {
        recordImportUsage(targetInfo.path, '*');
      }
    }
  }
}

const results = {
  modules: Array.from(moduleInfo.values()).map((info) => ({
    path: info.path,
    imports: Array.from(info.imports),
    importedByCount: info.importedBy.size,
    exports: Array.from(info.exports.values()),
    exportUsage: Object.fromEntries(info.exportUsage),
    sha256: info.sha256,
    structureHash: info.structureHash,
    sizeBytes: info.sizeBytes,
    lastModifiedMs: info.lastModifiedMs,
  })),
};

const outputPath = path.join(projectRoot, 'analysis', 'generated', 'static-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`Wrote analysis to ${normalizePath(path.relative(projectRoot, outputPath))}`);

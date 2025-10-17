import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const projectRoot = process.cwd();

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
};

const tsconfig = readJson(path.join(projectRoot, 'tsconfig.json')) || {};
const compilerOptions = tsconfig.compilerOptions || {};
const baseUrl = compilerOptions.baseUrl ? path.resolve(projectRoot, compilerOptions.baseUrl) : projectRoot;
const pathMappings = compilerOptions.paths || {};

const extensionsToTry = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

const pathAliasResolvers = Object.entries(pathMappings).map(([alias, targets]) => {
  const hasWildcard = alias.endsWith('/*');
  const aliasPrefix = hasWildcard ? alias.slice(0, -1) : alias;
  const targetStrings = (targets || []).map(target => ({
    hasWildcard: target.endsWith('/*'),
    prefix: target.endsWith('/*') ? target.slice(0, -1) : target
  }));
  return { alias, aliasPrefix, hasWildcard, targetStrings };
});

const toProjectRelative = (absPath) => {
  const rel = path.relative(projectRoot, absPath).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : rel;
};

const fileExistsWithExtensions = (basePath) => {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }
  for (const ext of extensionsToTry) {
    const withExt = `${basePath}${ext}`;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return withExt;
    }
  }
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const ext of extensionsToTry) {
      const indexCandidate = path.join(basePath, `index${ext}`);
      if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
        return indexCandidate;
      }
    }
  }
  return null;
};

const resolveImport = (specifier, fromFile) => {
  if (!specifier || typeof specifier !== 'string') {
    return null;
  }
  if (specifier.startsWith('.')) {
    const absPath = path.resolve(path.dirname(fromFile), specifier);
    const found = fileExistsWithExtensions(absPath);
    return found ? toProjectRelative(found) : null;
  }

  for (const resolver of pathAliasResolvers) {
    if (resolver.hasWildcard) {
      if (specifier.startsWith(resolver.aliasPrefix.slice(0, -1))) {
        const remainder = specifier.slice(resolver.aliasPrefix.length - 1);
        for (const target of resolver.targetStrings) {
          const candidate = target.hasWildcard
            ? path.resolve(baseUrl, target.prefix + remainder)
            : path.resolve(baseUrl, target.prefix);
          const found = fileExistsWithExtensions(candidate);
          if (found) {
            return toProjectRelative(found);
          }
        }
      }
    } else {
      if (specifier === resolver.alias) {
        for (const target of resolver.targetStrings) {
          const candidate = path.resolve(baseUrl, target.prefix);
          const found = fileExistsWithExtensions(candidate);
          if (found) {
            return toProjectRelative(found);
          }
        }
      }
    }
  }

  if (specifier.startsWith('@/')) {
    const trimmed = specifier.slice(2);
    const candidate = path.resolve(baseUrl, trimmed);
    const found = fileExistsWithExtensions(candidate);
    return found ? toProjectRelative(found) : null;
  }

  const candidate = path.resolve(baseUrl, specifier);
  const found = fileExistsWithExtensions(candidate);
  if (found) {
    return toProjectRelative(found);
  }
  return null;
};

const shouldIncludeFile = (filePath) => {
  if (!/(\.tsx?|\.jsx?)$/i.test(filePath)) return false;
  if (filePath.includes('node_modules')) return false;
  if (filePath.includes('dist/')) return false;
  if (filePath.includes('build/')) return false;
  if (filePath.includes('.vite/')) return false;
  return true;
};

const collectFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      files.push(...collectFiles(absPath));
    } else if (entry.isFile()) {
      const rel = toProjectRelative(absPath);
      if (shouldIncludeFile(rel)) {
        files.push(absPath);
      }
    }
  }
  return files;
};

const files = collectFiles(projectRoot);

const dependencyGraph = [];
const fileNodes = new Map();

const getLayer = (relPath) => {
  const parts = relPath.split('/');
  switch (parts[0]) {
    case 'core':
      return 'core';
    case 'agents':
      return 'agents';
    case 'services':
      return 'services';
    case 'orchestration':
      return 'orchestration';
    case 'ui':
      return 'ui';
    default:
      return 'other';
  }
};

for (const abs of files) {
  const rel = toProjectRelative(abs);
  fileNodes.set(rel, { path: rel, layer: getLayer(rel), imports: [] });
}

for (const abs of files) {
  const rel = toProjectRelative(abs);
  const content = fs.readFileSync(abs, 'utf8');
  const scriptKind = abs.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(abs, content, ts.ScriptTarget.ES2020, true, scriptKind);

  const imports = [];

  const visit = (node) => {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        const decl = node;
        const spec = decl.moduleSpecifier && decl.moduleSpecifier.text;
        if (spec) imports.push(spec);
        break;
      }
      case ts.SyntaxKind.ExportDeclaration: {
        const decl = node;
        if (decl.moduleSpecifier && decl.moduleSpecifier.text) {
          imports.push(decl.moduleSpecifier.text);
        }
        break;
      }
      case ts.SyntaxKind.CallExpression: {
        const call = node;
        if (call.expression && call.expression.kind === ts.SyntaxKind.ImportKeyword && call.arguments.length === 1) {
          const arg = call.arguments[0];
          if (ts.isStringLiteral(arg)) {
            imports.push(arg.text);
          }
        }
        break;
      }
      default:
        break;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  const resolved = imports.map(spec => {
    const target = resolveImport(spec, abs);
    return {
      specifier: spec,
      resolved: target,
      external: !target,
    };
  });

  const node = fileNodes.get(rel);
  if (node) {
    node.imports = resolved;
  }

  for (const entry of resolved) {
    if (entry.resolved) {
      dependencyGraph.push({ from: rel, to: entry.resolved, specifier: entry.specifier });
    }
  }
}

const incoming = new Map(Array.from(fileNodes.keys()).map(key => [key, 0]));
for (const edge of dependencyGraph) {
  incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
}

const result = {
  projectRoot: projectRoot.replace(/\\/g, '/'),
  summary: {
    fileCount: files.length,
  },
  nodes: Array.from(fileNodes.values()),
  edges: dependencyGraph,
  incomingEdges: Object.fromEntries(incoming),
};

console.log(JSON.stringify(result, null, 2));

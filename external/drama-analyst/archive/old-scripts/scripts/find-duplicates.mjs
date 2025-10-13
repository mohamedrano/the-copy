import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const projectRoot = process.cwd();
const includedDirs = ['agents', 'core', 'orchestration', 'services', 'ui'];

const isTargetFile = (relPath) => /\.(tsx?|jsx?)$/i.test(relPath);

const files = [];
const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(projectRoot, abs).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'analysis' || entry.name === 'scripts') {
        continue;
      }
      walk(abs);
    } else if (entry.isFile()) {
      if (isTargetFile(rel)) {
        files.push({ abs, rel });
      }
    }
  }
};

for (const dir of includedDirs) {
  const absDir = path.join(projectRoot, dir);
  if (fs.existsSync(absDir)) {
    walk(absDir);
  }
}

const hashMap = new Map();
for (const file of files) {
  const content = fs.readFileSync(file.abs);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  if (!hashMap.has(hash)) hashMap.set(hash, []);
  hashMap.get(hash).push(file.rel);
}

const duplicates = Array.from(hashMap.entries())
  .filter(([, paths]) => paths.length > 1)
  .map(([hash, paths]) => ({ hash: `sha256:${hash}`, files: paths }));

fs.writeFileSync(path.join(projectRoot, 'analysis', 'duplicate-files.json'), JSON.stringify(duplicates, null, 2), 'utf8');

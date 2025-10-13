import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projects = [
  { name: 'Drama Analyst', source: 'external/drama-analyst', target: 'public/drama-analyst' },
  { name: 'Stations', source: 'external/stations', target: 'public/stations' },
  { name: 'Multi-Agent Story', source: 'external/multi-agent-story/jules-frontend', target: 'public/multi-agent-story' }
];

console.log('🚀 Building external projects...\n');
let hasErrors = false;

for (const p of projects) {
  console.log(`📦 Building ${p.name}...`);
  try {
    execSync('npm ci', { cwd: p.source, stdio: 'inherit' });
    execSync('npm run build', { cwd: p.source, stdio: 'inherit' });

    const distPath = path.join(p.source, 'dist');
    const targetPath = path.resolve(p.target);

    if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
    fs.mkdirSync(targetPath, { recursive: true });
    fs.cpSync(distPath, targetPath, { recursive: true });

    console.log(`✅ ${p.name} built and copied to ${p.target}\n`);
  } catch (e) {
    console.error(`❌ Error building ${p.name}:`, e?.message || e);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('❌ One or more external projects failed to build.');
  process.exit(1);
}
console.log('✅ All external projects built successfully!');

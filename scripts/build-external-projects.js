import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// قائمة المشاريع الخارجية مع المسارات
const projects = [
  { 
    name: 'Drama Analyst', 
    source: 'external/drama-analyst', 
    target: 'public/drama-analyst',
    port: 5001,
    basePath: '/drama-analyst/'
  },
  { 
    name: 'Stations', 
    source: 'external/stations', 
    target: 'public/stations',
    port: 5002,
    basePath: '/stations/'
  },
  { 
    name: 'Multi-Agent Story', 
    source: 'external/multi-agent-story/jules-frontend', 
    target: 'public/multi-agent-story',
    port: 5003,
    basePath: '/multi-agent-story/'
  }
];

// إنشاء مجلد التقارير
const reportsDir = 'reports/build-logs';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const buildLog = {
  timestamp: new Date().toISOString(),
  projects: [],
  summary: {
    total: projects.length,
    successful: 0,
    failed: 0,
    duration: 0
  }
};

const startTime = Date.now();

console.log('🚀 Building external projects...\n');
console.log(`📅 Build started at: ${new Date().toLocaleString()}\n`);

let hasErrors = false;

for (const project of projects) {
  const projectStartTime = Date.now();
  const projectLog = {
    name: project.name,
    source: project.source,
    target: project.target,
    status: 'pending',
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    errors: [],
    warnings: [],
    buildSize: 0
  };

  console.log(`📦 Building ${project.name}...`);
  console.log(`   Source: ${project.source}`);
  console.log(`   Target: ${project.target}`);
  console.log(`   Port: ${project.port}`);
  console.log(`   Base Path: ${project.basePath}`);

  try {
    // التحقق من وجود المشروع
    if (!fs.existsSync(project.source)) {
      throw new Error(`Project directory not found: ${project.source}`);
    }

    // التحقق من وجود package.json
    const packageJsonPath = path.join(project.source, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json not found in ${project.source}`);
    }

    // قراءة package.json للتحقق من الاسم
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`   Package: ${packageJson.name}@${packageJson.version}`);

    // تثبيت الحزم
    console.log(`   Installing dependencies...`);
    execSync('npm ci', { 
      cwd: project.source, 
      stdio: 'pipe',
      encoding: 'utf8'
    });

    // تنظيف legacy dist structure قبل البناء
    const legacyNestedDist = path.join(project.source, 'dist', 'public');
    if (fs.existsSync(legacyNestedDist)) {
      console.log(`   Cleaning legacy dist structure...`);
      fs.rmSync(legacyNestedDist, { recursive: true, force: true });
    }

    // تنظيف dist folder
    const distPath = path.join(project.source, 'dist');
    if (fs.existsSync(distPath)) {
      console.log(`   Cleaning existing dist folder...`);
      fs.rmSync(distPath, { recursive: true, force: true });
    }

    // بناء المشروع
    console.log(`   Building project...`);
    execSync('npm run build', { 
      cwd: project.source, 
      stdio: 'pipe',
      encoding: 'utf8'
    });

    // التحقق من وجود dist folder
    if (!fs.existsSync(distPath)) {
      throw new Error(`Build failed: dist folder not created at ${distPath}`);
    }

    // حساب حجم البناء
    const buildSize = calculateDirectorySize(distPath);
    projectLog.buildSize = buildSize;
    console.log(`   Build size: ${formatBytes(buildSize)}`);

    // تنظيف مسار النسخ النهائي قبل النسخ
    const targetPath = path.resolve(project.target);
    if (fs.existsSync(targetPath)) {
      console.log(`   Cleaning target directory...`);
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    // إنشاء مجلد الهدف ونسخ الملفات
    console.log(`   Copying files to target...`);
    fs.mkdirSync(targetPath, { recursive: true });
    fs.cpSync(distPath, targetPath, { recursive: true });

    // التحقق من النسخ الناجح
    if (!fs.existsSync(targetPath) || fs.readdirSync(targetPath).length === 0) {
      throw new Error(`Copy failed: target directory is empty or doesn't exist`);
    }

    const projectEndTime = Date.now();
    projectLog.status = 'success';
    projectLog.endTime = new Date().toISOString();
    projectLog.duration = projectEndTime - projectStartTime;
    buildLog.summary.successful++;

    console.log(`✅ ${project.name} built successfully in ${projectLog.duration}ms`);
    console.log(`   Size: ${formatBytes(buildSize)}`);
    console.log(`   Target: ${project.target}\n`);

  } catch (error) {
    const projectEndTime = Date.now();
    projectLog.status = 'failed';
    projectLog.endTime = new Date().toISOString();
    projectLog.duration = projectEndTime - projectStartTime;
    projectLog.errors.push(error.message);
    buildLog.summary.failed++;

    console.error(`❌ Error building ${project.name}:`);
    console.error(`   ${error.message}`);
    console.error(`   Duration: ${projectLog.duration}ms\n`);
    
    hasErrors = true;
  }

  buildLog.projects.push(projectLog);
}

const endTime = Date.now();
buildLog.summary.duration = endTime - startTime;

// حفظ تقرير البناء
const reportPath = path.join(reportsDir, `build-${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(buildLog, null, 2));

console.log('📊 Build Summary:');
console.log(`   Total projects: ${buildLog.summary.total}`);
console.log(`   Successful: ${buildLog.summary.successful}`);
console.log(`   Failed: ${buildLog.summary.failed}`);
console.log(`   Duration: ${buildLog.summary.duration}ms`);
console.log(`   Report saved to: ${reportPath}`);

if (hasErrors) {
  console.error('\n❌ One or more external projects failed to build.');
  console.error('Check the build log for details.');
  process.exit(1);
}

console.log('\n✅ All external projects built successfully!');

// Helper functions
function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => {
        calculateSize(path.join(itemPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
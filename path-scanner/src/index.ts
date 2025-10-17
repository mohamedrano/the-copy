import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';

interface ScanOptions {
  includeHidden: boolean;
  filesOnly: boolean;
  dirsOnly: boolean;
  outputFile?: string;
}

interface ScanResult {
  paths: string[];
  errors: Array<{ path: string; error: string }>;
  stats: {
    totalFiles: number;
    totalDirs: number;
    totalSize: number;
  };
}

async function scanDirectory(
  rootPath: string,
  options: ScanOptions
): Promise<ScanResult> {
  const result: ScanResult = {
    paths: [],
    errors: [],
    stats: { totalFiles: 0, totalDirs: 0, totalSize: 0 },
  };

  async function scan(currentPath: string): Promise<void> {
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!options.includeHidden && entry.name.startsWith('.')) {
          continue;
        }

        const fullPath = join(currentPath, entry.name);

        try {
          const stats = await stat(fullPath);

          if (entry.isDirectory()) {
            result.stats.totalDirs++;
            if (!options.filesOnly) {
              result.paths.push(fullPath);
            }
            await scan(fullPath);
          } else if (entry.isFile()) {
            result.stats.totalFiles++;
            result.stats.totalSize += stats.size;
            if (!options.dirsOnly) {
              result.paths.push(fullPath);
            }
          }
        } catch (error) {
          result.errors.push({
            path: fullPath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      result.errors.push({
        path: currentPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const normalizedPath = resolve(rootPath);
  
  try {
    const stats = await stat(normalizedPath);
    if (!stats.isDirectory()) {
      throw new Error(`المسار ليس مجلداً: ${normalizedPath}`);
    }
  } catch (error) {
    throw new Error(
      `فشل الوصول للمسار: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  await scan(normalizedPath);
  return result;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

async function main(): Promise<void> {
  const args = argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    stdout.write(`
الاستخدام: node dist/index.js <المسار> [خيارات]

الخيارات:
  --files-only        الملفات فقط
  --dirs-only         المجلدات فقط
  --include-hidden    تضمين الملفات المخفية
  --output <ملف>     حفظ النتائج في ملف
  --help, -h          عرض هذه المساعدة

مثال:
  node dist/index.js "H:\\the-copy\\external"
  node dist/index.js "H:\\the-copy\\external" --files-only --output paths.txt
`);
    exit(0);
  }

  const targetPath = args[0];
  const options: ScanOptions = {
    includeHidden: args.includes('--include-hidden'),
    filesOnly: args.includes('--files-only'),
    dirsOnly: args.includes('--dirs-only'),
    outputFile: args.includes('--output') ? args[args.indexOf('--output') + 1] : undefined,
  };

  if (options.filesOnly && options.dirsOnly) {
    stderr.write('خطأ: لا يمكن استخدام --files-only و --dirs-only معاً\n');
    exit(1);
  }

  try {
    stderr.write(`جاري المسح: ${targetPath}\n`);
    const startTime = performance.now();
    
    const result = await scanDirectory(targetPath, options);
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (options.outputFile) {
      const { writeFile } = await import('node:fs/promises');
      await writeFile(options.outputFile, result.paths.join('\n'), 'utf-8');
      stderr.write(`\nتم حفظ ${result.paths.length} مسار في: ${options.outputFile}\n`);
    } else {
      result.paths.forEach((path) => stdout.write(`${path}\n`));
    }

    stderr.write(`\n=== الإحصائيات ===\n`);
    stderr.write(`المجلدات: ${result.stats.totalDirs}\n`);
    stderr.write(`الملفات: ${result.stats.totalFiles}\n`);
    stderr.write(`الحجم الكلي: ${formatBytes(result.stats.totalSize)}\n`);
    stderr.write(`المسارات المعروضة: ${result.paths.length}\n`);
    stderr.write(`الوقت المستغرق: ${duration}s\n`);

    if (result.errors.length > 0) {
      stderr.write(`\n=== الأخطاء (${result.errors.length}) ===\n`);
      result.errors.forEach(({ path, error }) => {
        stderr.write(`${path}: ${error}\n`);
      });
    }
  } catch (error) {
    stderr.write(`خطأ: ${error instanceof Error ? error.message : String(error)}\n`);
    exit(1);
  }
}

main().catch((error) => {
  stderr.write(`خطأ غير متوقع: ${error}\n`);
  exit(1);
});





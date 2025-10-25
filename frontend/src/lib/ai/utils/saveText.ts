import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * حفظ محتوى نصي إلى ملف
 * @param filePath المسار النسبي للملف
 * @param content المحتوى النصي
 */
export async function saveText(filePath: string, content: string): Promise<void> {
  const fullPath = path.resolve(process.cwd(), filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}
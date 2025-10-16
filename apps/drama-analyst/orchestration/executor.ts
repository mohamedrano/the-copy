import { AIRequest, AIResponse, Result, ProcessedFile } from '@core/types';
import { readFiles } from '@services/fileReaderService';
import { callModel } from '@services/apiService';
import { log } from '@services/loggerService';

export interface PrepareFilesRequest {
  files: File[];
}

/**
 * معالجة الملفات المرفوعة من المتصفح
 */
export const prepareFiles = async (request: PrepareFilesRequest): Promise<Result<ProcessedFile[]>> => {
  log.info(`📂 Processing ${request.files.length} file(s)...`, null, 'Executor');

  if (request.files.length === 0) {
    return {
      ok: false,
      error: {
        code: 'NO_FILES',
        message: 'لم يتم رفع أي ملفات',
        cause: null
      }
    };
  }

  // التحقق من حجم الملفات
  const maxSize = 20 * 1024 * 1024; // 20MB
  const oversizedFiles = request.files.filter(f => f.size > maxSize);

  if (oversizedFiles.length > 0) {
    return {
      ok: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `الملفات التالية تتجاوز الحد الأقصى (20MB): ${oversizedFiles.map(f => f.name).join(', ')}`,
        cause: { oversizedFiles: oversizedFiles.map(f => f.name) }
      }
    };
  }

  return readFiles(request.files);
};

/**
 * إرسال المهمة إلى النموذج
 */
export const submitTask = async (request: AIRequest): Promise<Result<AIResponse>> => {
  log.info(`🚀 Submitting task with agent: ${request.agent}`, null, 'Executor');

  // التحقق من وجود ملفات
  if (!request.files || request.files.length === 0) {
    return {
      ok: false,
      error: {
        code: 'NO_FILES',
        message: 'يجب رفع ملف واحد على الأقل',
        cause: null
      }
    };
  }

  return callModel(request);
};
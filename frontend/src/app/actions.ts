"use server";

import {
  AnalysisPipeline,
  type PipelineInput,
  type PipelineRunResult,
  validateAndNormalizePipelineInput,
} from "@/lib/ai/stations/run-all-stations";

// Re-export types for use in client components
export type { PipelineInput, PipelineRunResult };

/**
 * Server action to run the full analysis pipeline
 * Validates input using Zod schema before processing
 */
export async function runFullPipeline(
  input: unknown
): Promise<PipelineRunResult> {
  // التحقق من وجود مفتاح API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY غير موجود في متغيرات البيئة");
  }

  // التحقق من المدخلات وتطبيعها
  let validatedInput: PipelineInput;
  try {
    validatedInput = validateAndNormalizePipelineInput(input);
  } catch (error) {
    throw new Error(
      `خطأ في التحقق من المدخلات: ${error instanceof Error ? error.message : "خطأ غير معروف"}`
    );
  }

  // إنشاء pipeline وتشغيله
  const pipeline = new AnalysisPipeline({
    apiKey,
  });

  try {
    const result = await pipeline.runFullAnalysis(validatedInput);

    return {
      stationOutputs: result.stationOutputs,
      pipelineMetadata: result.pipelineMetadata,
    };
  } catch (error) {
    throw new Error(
      `فشل تشغيل التحليل: ${error instanceof Error ? error.message : "خطأ غير معروف"}`
    );
  }
}

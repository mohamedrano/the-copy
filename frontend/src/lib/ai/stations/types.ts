// src/lib/ai/stations/types.ts
import { z } from "zod";

export const PipelineInputSchema = z.object({
  screenplayText: z.string().min(1),
  language: z.enum(["ar", "en"]).default("ar"),
  context: z
    .object({
      title: z.string().optional(),
      author: z.string().optional(),
      sceneHints: z.array(z.string()).optional(),
    })
    .default({}),
  flags: z
    .object({
      runStations: z.boolean().default(true),
      fastMode: z.boolean().default(false),
    })
    .default({}),
  agents: z
    .object({
      set: z.array(z.string()).optional(),
      temperature: z.number().min(0).max(2).default(0.2),
    })
    .default({ temperature: 0.2 }),
});

export type PipelineInput = z.infer<typeof PipelineInputSchema>;

// Keep existing types below for compatibility
export const OldPipelineInputSchema = z.object({
  fullText: z.string().min(1, "fullText is required"),
  projectName: z.string().min(1, "projectName is required"),
  proseFilePath: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
  context: z
    .object({
      title: z.string().optional(),
      author: z.string().optional(),
      sceneHints: z.array(z.string()).optional(),
      genre: z.string().optional(),
      description: z.string().optional(),
    })
    .optional()
    .default({}),
  flags: z
    .object({
      runStations: z.boolean().default(true),
      fastMode: z.boolean().default(false),
      skipValidation: z.boolean().default(false),
      verboseLogging: z.boolean().default(false),
    })
    .optional()
    .default({
      runStations: true,
      fastMode: false,
      skipValidation: false,
      verboseLogging: false,
    }),
  agents: z
    .object({
      set: z.array(z.string()).optional(), // مثل: ['characterDeepAnalyzer', ...]
      temperature: z.number().min(0).max(2).default(0.2),
      maxTokens: z.number().positive().optional(),
      model: z.string().optional(),
    })
    .optional()
    .default({ temperature: 0.2 }),
});

/**
 * نوع TypeScript المستنتج من مخطط Zod (already defined above)
 */

/**
 * مخطط لمخرجات خط الأنابيب
 */
export const PipelineRunResultSchema = z.object({
  stationOutputs: z.object({
    station1: z.any(),
    station2: z.any(),
    station3: z.any(),
    station4: z.any(),
    station5: z.any(),
    station6: z.any(),
    station7: z.any(),
  }),
  pipelineMetadata: z.object({
    stationsCompleted: z.number(),
    totalExecutionTime: z.number(),
    startedAt: z.string(),
    finishedAt: z.string(),
  }),
});

export type PipelineRunResult = z.infer<typeof PipelineRunResultSchema>;

/**
 * حالات المحطات
 */
export type StationStatus = "pending" | "running" | "completed" | "error";

/**
 * دالة مساعدة لتطبيع المدخلات من صيغ مختلفة
 * تدعم حقول قديمة مثل screenplayText, text, script
 */
export function normalizePipelineInput(input: unknown): unknown {
  if (!input || typeof input !== "object") {
    return input;
  }

  const body = input as Record<string, unknown>;

  return {
    // دعم أسماء بديلة للنص
    fullText:
      body.fullText ?? body.screenplayText ?? body.text ?? body.script ?? "",

    // اسم المشروع
    projectName: body.projectName ?? body.project ?? "untitled-project",

    // مسار النثر
    proseFilePath: body.proseFilePath,

    // اللغة
    language: body.language ?? "ar",

    // السياق
    context: {
      title: body.title,
      author: body.author,
      sceneHints: body.sceneHints,
      genre: body.genre,
      description: body.description,
      ...(typeof body.context === "object" && body.context !== null
        ? body.context
        : {}),
    },

    // الأعلام
    flags: {
      runStations: body.runStations ?? true,
      fastMode: body.fastMode ?? false,
      skipValidation: body.skipValidation ?? false,
      verboseLogging: body.verboseLogging ?? false,
      ...(typeof body.flags === "object" && body.flags !== null
        ? body.flags
        : {}),
    },

    // خيارات الوكلاء
    agents: {
      set: body.agentSet ?? body.agents,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      model: body.model,
      ...(typeof body.agents === "object" &&
      body.agents !== null &&
      !Array.isArray(body.agents)
        ? body.agents
        : {}),
    },
  };
}

/**
 * دالة مساعدة للتحقق والتطبيع في خطوة واحدة
 */
export function validateAndNormalizePipelineInput(
  input: unknown
): PipelineInput {
  const normalized = normalizePipelineInput(input);
  return PipelineInputSchema.parse(normalized);
}

import { ZodError, z } from "zod";
import { AnalysisPipeline } from "./run-all-stations";
import { GeminiService, GeminiModel } from "./gemini-service";
import {
  Station1TextAnalysis,
  type Station1Input,
  type Station1Output,
} from "./station1-text-analysis";
import {
  Station2ConceptualAnalysis,
  type Station2Input,
  type Station2Output,
} from "./station2-conceptual-analysis";
import {
  Station3NetworkBuilder,
  type Station3Input,
  type Station3Output,
} from "./station3-network-builder";
import { PipelineInputSchema } from "./types";
import logger from "../utils/logger";
import type { StationConfig } from "../core/pipeline/base-station";

// مخطط التحقق من البيانات الأساسي
const analyzeTextSchema = z.object({
  fullText: z.string().min(1, "fullText is required"),
  projectName: z.string().min(1, "projectName is required"),
  proseFilePath: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

if (!GEMINI_API_KEY) {
  logger.warn("⚠️  GEMINI_API_KEY is not set. Text analysis will fail.");
  logger.warn("Please set GEMINI_API_KEY in your environment variables.");
}

const geminiService = new GeminiService({
  apiKey: GEMINI_API_KEY,
  defaultModel: GeminiModel.PRO,
  fallbackModel: GeminiModel.FLASH,
  maxRetries: 3,
  timeout: 60_000,
});

const analysisPipeline = new AnalysisPipeline({
  apiKey: GEMINI_API_KEY,
  geminiService,
});

const station1 = new Station1TextAnalysis(
  createStationConfig<Station1Input, Station1Output>(1, "Text Analysis"),
  geminiService
);
const station2 = new Station2ConceptualAnalysis(
  createStationConfig<Station2Input, Station2Output>(2, "Conceptual Analysis"),
  geminiService
);
const station3 = new Station3NetworkBuilder(
  createStationConfig<Station3Input, Station3Output>(3, "Network Builder"),
  geminiService
);

/**
 * Helper function to analyze text using stations 1-3
 */
export async function analyzeText(input: unknown) {
  try {
    const validatedData = analyzeTextSchema.parse(input);

    const station1Input: Station1Input = {
      fullText: validatedData.fullText,
      projectName: validatedData.projectName,
    };
    if (validatedData.proseFilePath !== undefined) {
      station1Input.proseFilePath = validatedData.proseFilePath;
    }
    const station1Result = await station1.execute(station1Input);

    const station2Result = await station2.execute({
      station1Output: station1Result.output,
      fullText: validatedData.fullText,
    });

    const station3Result = await station3.execute({
      station1Output: station1Result.output,
      station2Output: station2Result.output,
      fullText: validatedData.fullText,
    });

    const response: Station1Output = station1Result.output;

    return {
      station1: {
        majorCharacters: response.majorCharacters,
        characterAnalysis: Object.fromEntries(response.characterAnalysis),
        relationshipAnalysis: response.relationshipAnalysis,
        narrativeStyleAnalysis: response.narrativeStyleAnalysis,
        metadata: {
          analysisTimestamp: response.metadata.analysisTimestamp.toISOString(),
          status: response.metadata.status,
        },
      },
      station2: {
        storyStatement: station2Result.output.storyStatement,
        elevatorPitch: station2Result.output.elevatorPitch,
        hybridGenre: station2Result.output.hybridGenre,
      },
      station3: {
        networkSummary: station3Result.output.networkSummary,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`بيانات غير صالحة: ${JSON.stringify(error.flatten())}`);
    }

    logger.error("Error analyzing text", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw new Error(
      `فشل تحليل النص: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Helper function to run full pipeline analysis
 */
export async function analyzeFullPipeline(input: unknown) {
  try {
    // تطبيع جسم الطلب
    const body = input as any;
    const normalized = {
      screenplayText:
        body.screenplayText ?? body.text ?? body.script ?? body.fullText ?? "",
      language: body.language ?? "ar",
      context: {
        title: body.title ?? body.projectName,
        author: body.author,
        sceneHints: body.sceneHints,
      },
      flags: {
        runStations: body.runStations ?? true,
        fastMode: body.fastMode ?? false,
      },
      agents: {
        set: body.agentSet,
        temperature: body.temperature ?? 0.2,
      },
    };

    const pipelineInput = PipelineInputSchema.parse(normalized);

    logger.info("[API] Full pipeline analysis started", {
      textLength: pipelineInput.screenplayText.length,
      language: pipelineInput.language,
    });

    const normalizedForPipeline = {
      screenplayText: pipelineInput.screenplayText ?? "",
      language: pipelineInput.language ?? "ar",
      context: { title: body.projectName, author: pipelineInput.context?.author, sceneHints: pipelineInput.context?.sceneHints },
      flags: { runStations: true, fastMode: false },
      agents: { set: undefined, temperature: 0.2 },
    };
    const result = await analysisPipeline.runFullAnalysis(normalizedForPipeline);

    return {
      success: true,
      data: toSerializable(result.stationOutputs),
      metadata: result.pipelineMetadata,
      message: `تم إنجاز ${result.pipelineMetadata.stationsCompleted} محطات من أصل 7`,
      executionTime: `${(result.pipelineMetadata.totalExecutionTime / 1000).toFixed(1)} ثانية`,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`بيانات غير صالحة: ${JSON.stringify(error.flatten())}`);
    }

    logger.error("Error in full pipeline", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(
      `فشل تشغيل Pipeline الشامل: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get stations status
 */
export function getStationsStatus() {
  const status = analysisPipeline.getStationStatus();
  const values = Object.values(status);

  return {
    success: true,
    stations: status,
    totalStations: values.length,
    availableStations: values.filter((value) => value === "completed").length,
  };
}

function createStationConfig<TInput, TOutput>(
  stationNumber: number,
  stationName: string
): StationConfig<TInput, TOutput> {
  return {
    stationNumber,
    stationName,
    cacheEnabled: false,
    performanceTracking: true,
    inputValidation: (input: TInput) => input !== undefined && input !== null,
    outputValidation: (output: TOutput) =>
      output !== undefined && output !== null,
  };
}

function toSerializable(value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).map(([key, mapValue]) => [
        key,
        toSerializable(mapValue),
      ])
    );
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSerializable(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        toSerializable(entryValue),
      ])
    );
  }

  return value;
}

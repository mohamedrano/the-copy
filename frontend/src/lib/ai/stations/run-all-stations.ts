import * as fs from "fs";
import * as path from "path";
import {
  Station1TextAnalysis,
  type Station1Input,
  type Station1Output as S1O,
} from "./station1-text-analysis";
import {
  Station2ConceptualAnalysis,
  type Station2Output as S2O,
} from "./station2-conceptual-analysis";
import {
  Station3NetworkBuilder,
  type Station3Output as S3O,
} from "./station3-network-builder";
import {
  Station4EfficiencyMetrics,
  type Station4Output as S4O,
} from "./station4-efficiency-metrics";
import {
  Station5DynamicSymbolicStylistic,
  type Station5Output as S5O,
} from "./station5-dynamic-symbolic-stylistic";
import {
  Station6DiagnosticsAndTreatment,
  type Station6Output as S6O,
} from "./station6-diagnostics-treatment";
import {
  Station7Finalization,
  type Station7Output as S7O,
} from "./station7-finalization";
import { GeminiService, GeminiModel } from "./gemini-service";
import { type StationConfig } from "../core/pipeline/base-station";
import logger from "../utils/logger";
import {
  PipelineInputSchema,
  validateAndNormalizePipelineInput,
  type PipelineInput as ValidatedPipelineInput,
  type PipelineRunResult as ValidatedPipelineRunResult,
  type StationStatus as ValidatedStationStatus,
} from "./types";

// Re-exporting with a clearer naming convention for external use
export type Station1Output = S1O;
export type Station2Output = S2O;
export type Station3Output = S3O;
export type Station4Output = S4O;
export type Station5Output = S5O;
export type Station6Output = S6O;
export type Station7Output = S7O;

// Re-export types from types.ts for backward compatibility
export type PipelineInput = ValidatedPipelineInput;
export type PipelineRunResult = ValidatedPipelineRunResult;
export type StationStatus = ValidatedStationStatus;

// Export the schema and validation utilities for external use
export { PipelineInputSchema, validateAndNormalizePipelineInput };

interface AnalysisPipelineConfig {
  apiKey: string;
  outputDir?: string;
  geminiService?: GeminiService;
}

export class AnalysisPipeline {
  private readonly geminiService: GeminiService;
  private readonly stationStatuses = new Map<number, StationStatus>();
  private readonly station1: Station1TextAnalysis;
  private readonly station2: Station2ConceptualAnalysis;
  private readonly station3: Station3NetworkBuilder;
  private readonly station4: Station4EfficiencyMetrics;
  private readonly station5: Station5DynamicSymbolicStylistic;
  private readonly station6: Station6DiagnosticsAndTreatment;
  private readonly station7: Station7Finalization;
  private readonly outputDirectory: string;

  constructor(config: AnalysisPipelineConfig) {
    if (!config.apiKey) {
      logger.warn(
        "[AnalysisPipeline] GEMINI_API_KEY not set. AI analysis endpoints will respond with 503."
      );
      // Create a dummy service that will fail gracefully
      this.geminiService =
        config.geminiService ??
        new GeminiService({
          apiKey: "dummy-key-ai-disabled",
          defaultModel: GeminiModel.FLASH,
          fallbackModel: GeminiModel.FLASH,
          maxRetries: 0,
          timeout: 1000,
        });
    } else {
      this.geminiService =
        config.geminiService ??
        new GeminiService({
          apiKey: config.apiKey,
          defaultModel: GeminiModel.FLASH,
          fallbackModel: GeminiModel.FLASH_LITE,
          maxRetries: 3,
          timeout: 60_000,
        });
    }

    this.outputDirectory =
      config.outputDir ?? path.join(process.cwd(), "analysis_output");
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }

    this.station1 = new Station1TextAnalysis(
      this.createStationConfig<S1O>(1, "Text Analysis"),
      this.geminiService
    );
    this.station2 = new Station2ConceptualAnalysis(
      this.createStationConfig<S2O>(2, "Conceptual Analysis"),
      this.geminiService
    );
    this.station3 = new Station3NetworkBuilder(
      this.createStationConfig<S3O>(3, "Network Builder"),
      this.geminiService
    );
    this.station4 = new Station4EfficiencyMetrics(
      this.createStationConfig<S4O>(4, "Efficiency Metrics"),
      this.geminiService
    );
    this.station5 = new Station5DynamicSymbolicStylistic(
      this.createStationConfig<S5O>(5, "Dynamic/Symbolic/Stylistic Analysis"),
      this.geminiService
    );
    this.station6 = new Station6DiagnosticsAndTreatment(
      this.createStationConfig<S6O>(6, "Diagnostics & Treatment"),
      this.geminiService
    );
    this.station7 = new Station7Finalization(
      this.createStationConfig<S7O>(7, "Finalization & Visualization"),
      this.geminiService,
      this.outputDirectory
    );

    for (let i = 1; i <= 7; i += 1) {
      this.stationStatuses.set(i, "pending");
    }
  }

  getStationStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.stationStatuses.forEach((value, key) => {
      status[`station${key}`] = value;
    });
    return status;
  }

  async runFullAnalysis(input: unknown): Promise<PipelineRunResult> {
    // التحقق من المدخلات وتطبيعها باستخدام Zod
    const data: PipelineInput = PipelineInputSchema.parse(input);

    logger.info("[AnalysisPipeline] Input validated successfully", {
      textLength: data.screenplayText.length,
      language: data.language,
    });

    const startedAt = Date.now();
    let stationsCompleted = 0;
    const stationData = new Map<number, unknown>();

    const runStation = async <TInput, TOutput>(
      stationNumber: number,
      station: { execute: (input: TInput) => Promise<{ output: TOutput }> },
      stationInput: TInput
    ): Promise<TOutput> => {
      this.stationStatuses.set(stationNumber, "running");
      try {
        const { output } = await station.execute(stationInput);
        this.stationStatuses.set(stationNumber, "completed");
        stationsCompleted += 1;
        stationData.set(stationNumber, output);
        return output;
      } catch (error) {
        this.stationStatuses.set(stationNumber, "error");
        logger.error(`Station ${stationNumber} failed`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    };

    const station1Input: { fullText: string; projectName: string; proseFilePath?: string } = {
      fullText: data.screenplayText,
      projectName: data.context?.title ?? "untitled-project",
      // لا تضف المفتاح إن لم تكن القيمة موجودة
      ...((data as any)?.proseFilePath ? { proseFilePath: (data as any).proseFilePath as string } : {}),
    };
    const station1Output = await runStation(1, this.station1, station1Input);
    await new Promise(resolve => setTimeout(resolve, 6000));

    const station2Output = await runStation(2, this.station2, {
      station1Output,
      fullText: station1Input.fullText,
    });
    await new Promise(resolve => setTimeout(resolve, 6000));

    const station3Output = await runStation(3, this.station3, {
      station1Output,
      station2Output,
      fullText: station1Input.fullText,
    });
    await new Promise(resolve => setTimeout(resolve, 6000));

    const station4Output = await runStation(4, this.station4, {
      station3Output,
    });
    await new Promise(resolve => setTimeout(resolve, 6000));

    const station5Output = await runStation(5, this.station5, {
      conflictNetwork: station3Output.conflictNetwork,
      station4Output,
      fullText: station1Input.fullText,
    });
    await new Promise(resolve => setTimeout(resolve, 6000));

    const station6Output = await runStation(6, this.station6, {
      conflictNetwork: station3Output.conflictNetwork,
      station5Output,
    });
    await new Promise(resolve => setTimeout(resolve, 6000));

    const station7Output = await runStation(7, this.station7, {
      conflictNetwork: station3Output.conflictNetwork,
      station6Output,
      allPreviousStationsData: stationData,
    });

    const finishedAt = Date.now();

    return {
      stationOutputs: {
        station1: station1Output,
        station2: station2Output,
        station3: station3Output,
        station4: station4Output,
        station5: station5Output,
        station6: station6Output,
        station7: station7Output,
      },
      pipelineMetadata: {
        stationsCompleted,
        totalExecutionTime: finishedAt - startedAt,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date(finishedAt).toISOString(),
      },
    };
  }

  private createStationConfig<TOutput>(
    stationNumber: number,
    stationName: string
  ): StationConfig<any, TOutput> {
    return {
      stationId: `station${stationNumber}`,
      name: stationName,
      description: stationName,
      cacheEnabled: false,
      performanceTracking: true,
      inputValidation: (input: any) => input !== undefined && input !== null,
      outputValidation: (output: TOutput) =>
        output !== undefined && output !== null,
    };
  }
}

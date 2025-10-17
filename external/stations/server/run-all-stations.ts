import * as fs from 'fs';
import * as path from 'path';
import { Station1TextAnalysis, type Station1Input, type Station1Output } from './stations/station1/station1-text-analysis';
import { Station2ConceptualAnalysis, type Station2Input, type Station2Output } from './stations/station2/station2-conceptual-analysis';
import { Station3NetworkBuilder, type Station3Input, type Station3Output } from './stations/station3/station3-network-builder';
import { Station4EfficiencyMetrics, type Station4Input, type Station4Output } from './stations/station4/station4-efficiency-metrics';
import { Station5DynamicSymbolicStylistic, type Station5Input, type Station5Output } from './stations/station5/station5-dynamic-symbolic-stylistic';
import { Station6DiagnosticsAndTreatment, type Station6Input, type Station6Output } from './stations/station6/station6-diagnostics-treatment';
import { Station7Finalization, type Station7Input, type Station7Output } from './stations/station7/station7-finalization';
import { GeminiService, GeminiModel } from './services/ai/gemini-service';
import { type StationConfig } from './core/pipeline/base-station';
import logger from './utils/logger';

export interface PipelineInput {
  fullText: string;
  projectName: string;
  proseFilePath?: string;
}

export interface PipelineRunResult {
  stationOutputs: {
    station1: Station1Output;
    station2: Station2Output;
    station3: Station3Output;
    station4: Station4Output;
    station5: Station5Output;
    station6: Station6Output;
    station7: Station7Output;
  };
  pipelineMetadata: {
    stationsCompleted: number;
    totalExecutionTime: number;
    startedAt: string;
    finishedAt: string;
  };
}

export type StationStatus = 'pending' | 'running' | 'completed' | 'error';

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
      throw new Error('GEMINI_API_KEY is required to initialise the analysis pipeline.');
    }

    this.geminiService = config.geminiService ?? new GeminiService({
      apiKey: config.apiKey,
      defaultModel: GeminiModel.PRO,
      fallbackModel: GeminiModel.FLASH,
      maxRetries: 3,
      timeout: 60_000,
    });

     
    this.outputDirectory = config.outputDir ?? path.join(process.cwd(), 'analysis_output');
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }

    this.station1 = new Station1TextAnalysis(this.createStationConfig<Station1Input, Station1Output>(1, 'Text Analysis'), this.geminiService);
    this.station2 = new Station2ConceptualAnalysis(this.createStationConfig<Station2Input, Station2Output>(2, 'Conceptual Analysis'), this.geminiService);
    this.station3 = new Station3NetworkBuilder(this.createStationConfig<Station3Input, Station3Output>(3, 'Network Builder'), this.geminiService);
    this.station4 = new Station4EfficiencyMetrics(this.createStationConfig<Station4Input, Station4Output>(4, 'Efficiency Metrics'), this.geminiService);
    this.station5 = new Station5DynamicSymbolicStylistic(this.createStationConfig<Station5Input, Station5Output>(5, 'Dynamic/Symbolic/Stylistic Analysis'), this.geminiService);
    this.station6 = new Station6DiagnosticsAndTreatment(this.createStationConfig<Station6Input, Station6Output>(6, 'Diagnostics & Treatment'), this.geminiService);
    this.station7 = new Station7Finalization(
      this.createStationConfig<Station7Input, Station7Output>(7, 'Finalization & Visualization'),
      this.geminiService,
      this.outputDirectory,
    );

    for (let i = 1; i <= 7; i += 1) {
      this.stationStatuses.set(i, 'pending');
    }
  }

  getStationStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.stationStatuses.forEach((value, key) => {
      status[`station${key}`] = value;
    });
    return status;
  }

  async runFullAnalysis(input: PipelineInput): Promise<PipelineRunResult> {
    const startedAt = Date.now();
    let stationsCompleted = 0;
    const stationData = new Map<number, unknown>();

    const runStation = async <TOutput>(
      stationNumber: number,
      execute: () => Promise<{ output: TOutput }>,
    ): Promise<TOutput> => {
      this.stationStatuses.set(stationNumber, 'running');
      try {
        const { output } = await execute();
        this.stationStatuses.set(stationNumber, 'completed');
        stationsCompleted += 1;
        stationData.set(stationNumber, output);
        return output;
      } catch (error) {
        this.stationStatuses.set(stationNumber, 'error');
        logger.error(`Station ${stationNumber} failed`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    };

    const station1Input: Station1Input = {
      fullText: input.fullText,
      projectName: input.projectName,
    };
    if (input.proseFilePath !== undefined) {
      station1Input.proseFilePath = input.proseFilePath;
    }
    const station1Output = await runStation(1, () => this.station1.execute(station1Input));

    const station2Output = await runStation(2, () => this.station2.execute({
      station1Output,
      fullText: input.fullText,
    }));

    const station3Output = await runStation(3, () => this.station3.execute({
      station1Output,
      station2Output,
      fullText: input.fullText,
    }));

    const station4Output = await runStation(4, () => this.station4.execute({
      station3Output,
    }));

    const station5Output = await runStation(5, () => this.station5.execute({
      conflictNetwork: station3Output.conflictNetwork,
      station4Output,
      fullText: input.fullText,
    }));

    const station6Output = await runStation(6, () => this.station6.execute({
      conflictNetwork: station3Output.conflictNetwork,
      station5Output,
    }));

    const station7Output = await runStation(7, () => this.station7.execute({
      conflictNetwork: station3Output.conflictNetwork,
      station6Output,
      allPreviousStationsData: stationData,
    }));

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

  private createStationConfig<TInput, TOutput>(
    stationNumber: number,
    stationName: string,
  ): StationConfig<TInput, TOutput> {
    return {
      stationNumber,
      stationName,
      cacheEnabled: false,
      performanceTracking: true,
      inputValidation: (input: TInput) => input !== undefined && input !== null,
      outputValidation: (output: TOutput) => output !== undefined && output !== null,
    };
  }
}

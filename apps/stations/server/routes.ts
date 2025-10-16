import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { ZodError } from 'zod';
import { analyzeTextSchema } from '@shared/schema';
import { AnalysisPipeline } from './run-all-stations';
import { GeminiService, GeminiModel } from './services/ai/gemini-service';
import { Station1TextAnalysis, type Station1Input, type Station1Output } from './stations/station1/station1-text-analysis';
import { Station2ConceptualAnalysis, type Station2Input, type Station2Output } from './stations/station2/station2-conceptual-analysis';
import { Station3NetworkBuilder, type Station3Input, type Station3Output } from './stations/station3/station3-network-builder';
import { apiKeyAuth, optionalAuth } from './middleware/auth';
import { apiLimiter, aiAnalysisLimiter, readLimiter } from './middleware/rate-limit';
import { sanitizeInput, requireJsonContent } from './middleware/sanitize';
import healthRouter from './routes/health';
import logger from './utils/logger';
import type { StationConfig } from './core/pipeline/base-station';

 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

if (!GEMINI_API_KEY) {
  logger.warn('⚠️  GEMINI_API_KEY is not set. Text analysis will fail.');
  logger.warn('Please set GEMINI_API_KEY in your environment variables.');
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

const station1 = new Station1TextAnalysis(createStationConfig<Station1Input, Station1Output>(1, 'Text Analysis'), geminiService);
const station2 = new Station2ConceptualAnalysis(createStationConfig<Station2Input, Station2Output>(2, 'Conceptual Analysis'), geminiService);
const station3 = new Station3NetworkBuilder(createStationConfig<Station3Input, Station3Output>(3, 'Network Builder'), geminiService);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/', healthRouter);
  app.use('/api', apiLimiter);

  app.post(
    '/api/analyze-text',
    requireJsonContent,
    apiKeyAuth,
    aiAnalysisLimiter,
    sanitizeInput,
    async (req, res) => {
      try {
        const validatedData = analyzeTextSchema.parse(req.body);

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

        res.json({
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
        });
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'بيانات غير صالحة',
            message: error.flatten(),
          });
          return;
        }

        logger.error('Error analyzing text', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        res.status(500).json({
          error: 'فشل تحليل النص',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  );

  app.post(
    '/api/analyze-full-pipeline',
    requireJsonContent,
    apiKeyAuth,
    aiAnalysisLimiter,
    sanitizeInput,
    async (req, res) => {
      try {
        const validatedData = analyzeTextSchema.parse(req.body);

        const pipelineInput: any = {
          fullText: validatedData.fullText,
          projectName: validatedData.projectName,
        };
        if (validatedData.proseFilePath !== undefined) {
          pipelineInput.proseFilePath = validatedData.proseFilePath;
        }
        const result = await analysisPipeline.runFullAnalysis(pipelineInput);

        res.json({
          success: true,
          data: toSerializable(result.stationOutputs),
          metadata: result.pipelineMetadata,
          message: `تم إنجاز ${result.pipelineMetadata.stationsCompleted} محطات من أصل 7`,
          executionTime: `${(result.pipelineMetadata.totalExecutionTime / 1000).toFixed(1)} ثانية`,
        });
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: 'بيانات غير صالحة',
            message: error.flatten(),
          });
          return;
        }

        logger.error('Error in full pipeline', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        res.status(500).json({
          success: false,
          error: 'فشل تشغيل Pipeline الشامل',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  );

  app.get('/api/stations-status', optionalAuth, readLimiter, (_req, res) => {
    const status = analysisPipeline.getStationStatus();
    const values = Object.values(status);

    res.json({
      success: true,
      stations: status,
      totalStations: values.length,
      availableStations: values.filter((value) => value === 'completed').length,
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}

function createStationConfig<TInput, TOutput>(
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

function toSerializable(value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(Array.from(value.entries()).map(([key, mapValue]) => [key, toSerializable(mapValue)]));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSerializable(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, toSerializable(entryValue)]));
  }

  return value;
}

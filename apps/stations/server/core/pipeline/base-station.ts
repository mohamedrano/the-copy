import { GeminiService, GeminiModel } from '../../services/ai/gemini-service';
import logger from '../../utils/logger';

export interface StationConfig<TInput, TOutput> {
  stationNumber: number;
  stationName: string;
  inputValidation: (input: TInput) => boolean;
  outputValidation: (output: TOutput) => boolean;
  cacheEnabled: boolean;
  performanceTracking: boolean;
}

export interface StationMetadata {
  executionTime: number;
  timestamp: Date;
  modelUsed: GeminiModel;
  cacheHit: boolean;
  errorOccurred: boolean;
  errorDetails?: string;
}

export abstract class BaseStation<TInput, TOutput> {
  protected config: StationConfig<TInput, TOutput>;
  protected geminiService: GeminiService;
  protected cache: Map<string, TOutput>;

  constructor(
    config: StationConfig<TInput, TOutput>,
    geminiService: GeminiService
  ) {
    this.config = config;
    this.geminiService = geminiService;
    this.cache = new Map();
  }

  async execute(input: TInput): Promise<{
    output: TOutput;
    metadata: StationMetadata;
  }> {
    const startTime = Date.now();
    
    const safeInputSnapshot = this.extractRequiredData(input);

    try {
      this.validateInput(input);

      const cachedResult = this.checkCache(input);
      if (cachedResult) {
        return {
          output: cachedResult,
          metadata: this.createMetadata(startTime, true)
        };
      }
      
      const output = await this.process(input);
      
      this.validateOutput(output);
      
      this.saveToCache(input, output);
      
      return {
        output,
        metadata: this.createMetadata(startTime, false)
      };
      
    } catch (error) {
      return this.handleError(error, startTime, safeInputSnapshot);
    }
  }

  protected abstract process(input: TInput): Promise<TOutput>;

  protected abstract extractRequiredData(input: TInput): Record<string, unknown>;
  
  protected validateInput(input: TInput): void {
    if (!this.config.inputValidation(input)) {
      throw new Error(
        `Invalid input for ${this.config.stationName}`
      );
    }
  }
  
  protected validateOutput(output: TOutput): void {
    if (!this.config.outputValidation(output)) {
      throw new Error(
        `Invalid output from ${this.config.stationName}`
      );
    }
  }
  
  protected checkCache(input: TInput): TOutput | null {
    if (!this.config.cacheEnabled) return null;
    
    const cacheKey = this.generateCacheKey(input);
    return this.cache.get(cacheKey) || null;
  }
  
  protected saveToCache(input: TInput, output: TOutput): void {
    if (!this.config.cacheEnabled) return;
    
    const cacheKey = this.generateCacheKey(input);
    this.cache.set(cacheKey, output);
  }
  
  protected generateCacheKey(input: TInput): string {
    return JSON.stringify(input);
  }
  
  protected createMetadata(
    startTime: number,
    cacheHit: boolean
  ): StationMetadata {
    return {
      executionTime: Date.now() - startTime,
      timestamp: new Date(),
      modelUsed: GeminiModel.PRO,
      cacheHit,
      errorOccurred: false
    };
  }
  
  protected handleError(
    error: unknown,
    startTime: number,
    safeInputSnapshot: Record<string, unknown>
  ): { output: TOutput; metadata: StationMetadata } {
    logger.error(`Error in ${this.config.stationName}`, {
      station: this.config.stationName,
      stationNumber: this.config.stationNumber,
      input: safeInputSnapshot,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      output: this.getErrorFallback(),
      metadata: {
        ...this.createMetadata(startTime, false),
        errorOccurred: true,
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }

  protected abstract getErrorFallback(): TOutput;
}
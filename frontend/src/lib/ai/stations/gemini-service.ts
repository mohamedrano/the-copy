import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';

export enum GeminiModel {
  PRO = 'gemini-2.5-pro',
  FLASH = 'gemini-2.0-flash-lite',
}

export interface GeminiConfig {
  apiKey: string;
  defaultModel: GeminiModel;
  maxRetries: number;
  timeout: number;
  fallbackModel?: GeminiModel;
}

export interface GeminiRequest<T> {
  prompt: string;
  model?: GeminiModel;
  context?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Optional type guard that validates the structured payload before it is cast
   * to the expected generic type. When provided, the response must satisfy the
   * guard or the request will be treated as failed unless {@link allowPartial}
   * is also enabled.
   */
  validator?: (value: unknown) => value is T;
  /**
   * Allows callers to accept partially valid payloads when the validator fails
   * or when the JSON returned by Gemini is truncated. When enabled we attempt
   * to sanitise the parsed payload and pass it to {@link onPartialFallback} if
   * provided.
   */
  allowPartial?: boolean;
  /**
   * Optional transformer that can map a partially valid payload into the
   * expected type when {@link allowPartial} is true. This gives callers full
   * control over how to recover from incomplete responses.
   */
  onPartialFallback?: (value: unknown) => T;
}

export interface GeminiResponse<T> {
  model: GeminiModel;
  content: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    timestamp: Date;
    latency: number;
  };
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.validateModels();
  }

  private validateModels(): void {
    const allowedModels = Object.values(GeminiModel);
    if (!allowedModels.includes(this.config.defaultModel)) {
      throw new Error(
        `Invalid model: ${this.config.defaultModel}. ` +
        `Only ${allowedModels.join(', ')} are allowed.`
      );
    }

    if (this.config.fallbackModel && !allowedModels.includes(this.config.fallbackModel)) {
      throw new Error(
        `Invalid fallback model: ${this.config.fallbackModel}. ` +
        `Only ${allowedModels.join(', ')} are allowed.`
      );
    }
  }

  async generate<T>(request: GeminiRequest<T>): Promise<GeminiResponse<T>> {
    this.validateModels();

    const primaryModel = request.model ?? this.config.defaultModel;

    try {
      return await this.performRequest<T>({ ...request, model: primaryModel });
    } catch (primaryError) {
      if (
        this.config.fallbackModel &&
        this.config.fallbackModel !== primaryModel
      ) {
        logger.warn('Primary Gemini model failed. Falling back to secondary model.', {
          primaryModel,
          fallbackModel: this.config.fallbackModel,
        });

        return this.performRequest<T>({ ...request, model: this.config.fallbackModel });
      }

      return this.handleError<T>(primaryError, { ...request, model: primaryModel });
    }
  }

  private async performRequest<T>(request: GeminiRequest<T>): Promise<GeminiResponse<T>> {
    const startTime = Date.now();
    const modelName = request.model ?? this.config.defaultModel;
    const model = this.genAI.getGenerativeModel({ model: modelName });

    const fullPrompt = `${request.systemInstruction || ''}\n\nContext: ${request.context || 'N/A'}\n\nPrompt: ${request.prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    const usage = {
      promptTokens: fullPrompt.length / 4,
      completionTokens: text.length / 4,
      totalTokens: (fullPrompt.length + text.length) / 4,
    };

    return {
      model: modelName,
      content: this.parseResponse<T>(text, request),
      usage,
      metadata: {
        timestamp: new Date(),
        latency: Date.now() - startTime,
      },
    };
  }

  private parseResponse<T>(responseText: string, request: GeminiRequest<T>): T {
    const parseResult = this.extractJsonPayload(responseText);

    if (!parseResult.success || parseResult.value === undefined) {
      logger.warn('Gemini response did not contain valid JSON payload.', {
        warnings: parseResult.warnings,
      });
      return this.buildRawFallback<T>(responseText);
    }

    const payload = parseResult.value;
    const { validator, allowPartial, onPartialFallback } = request;

    if (validator) {
      if (validator(payload)) {
        return payload;
      }

      if (allowPartial) {
        const partial =
          onPartialFallback?.(payload) ?? this.sanitisePartialPayload(payload);

        if (partial !== undefined) {
          logger.warn('Gemini response failed validation; returning partial payload.', {
            warnings: parseResult.warnings,
          });
          return partial as T;
        }
      }

      throw new Error('Gemini response failed validation.');
    }

    if (this.isStructuredJson(payload)) {
      return payload as T;
    }

    logger.warn('Gemini response JSON was not an object or array.', {
      warnings: parseResult.warnings,
    });
    return this.buildRawFallback<T>(responseText);
  }

  private async handleError<T>(
    error: unknown,
    request: GeminiRequest<T>
  ): Promise<never> {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to generate content with model ${request.model}`, {
      error: message,
    });
    throw error instanceof Error ? error : new Error(message);
  }

  private extractJsonPayload(responseText: string): {
    success: boolean;
    value?: unknown;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const fencedMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const candidate = fencedMatch?.[1] ?? responseText;
    const attempts = [candidate, this.repairTruncatedJson(candidate)];

    for (const attempt of attempts) {
      if (attempt === undefined) {
        continue;
      }

      try {
        return {
          success: true,
          value: JSON.parse(attempt),
          warnings: warnings.filter(Boolean),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        warnings.push(message);
      }
    }

    return { success: false, warnings };
  }

  private repairTruncatedJson(payload: string): string | undefined {
    const lastObject = payload.lastIndexOf('}');
    const lastArray = payload.lastIndexOf(']');
    const lastIndex = Math.max(lastObject, lastArray);

    if (lastIndex === -1) {
      return undefined;
    }

    return payload.slice(0, lastIndex + 1);
  }

  private sanitisePartialPayload(value: unknown): Record<string, unknown> | unknown[] | undefined {
    if (Array.isArray(value)) {
      return value.filter(item => item !== undefined && item !== null);
    }

    if (this.isStructuredJson(value)) {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          ([, itemValue]) => itemValue !== undefined
        )
      );
    }

    return undefined;
  }

  private isStructuredJson(value: unknown): value is Record<string, unknown> | unknown[] {
    if (Array.isArray(value)) {
      return true;
    }

    return typeof value === 'object' && value !== null;
  }

  private buildRawFallback<T>(responseText: string): T {
    return { raw: responseText } as unknown as T;
  }
}

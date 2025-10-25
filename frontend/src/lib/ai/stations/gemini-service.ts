import { GoogleGenAI } from "@google/genai";
import logger from "../utils/logger";
import { toText } from "../gemini-core";

export enum GeminiModel {
  PRO = "gemini-2.5-pro",
  FLASH = "gemini-2.0-flash-001",
  FLASH_LITE = "gemini-2.0-flash-lite",
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
  validator?: (value: unknown) => value is T;
  allowPartial?: boolean;
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
  private ai: GoogleGenAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.validateModels();
  }

  private validateModels(): void {
    const allowedModels = Object.values(GeminiModel);
    if (!allowedModels.includes(this.config.defaultModel)) {
      throw new Error(
        `Invalid model: ${this.config.defaultModel}. ` +
          `Only ${allowedModels.join(", ")} are allowed.`
      );
    }

    if (
      this.config.fallbackModel &&
      !allowedModels.includes(this.config.fallbackModel)
    ) {
      throw new Error(
        `Invalid fallback model: ${this.config.fallbackModel}. ` +
          `Only ${allowedModels.join(", ")} are allowed.`
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
        logger.warn(
          "Primary Gemini model failed. Falling back to secondary model.",
          {
            primaryModel,
            fallbackModel: this.config.fallbackModel,
          }
        );

        return this.performRequest<T>({
          ...request,
          model: this.config.fallbackModel,
        });
      }

      return this.handleError<T>(primaryError, {
        ...request,
        model: primaryModel,
      });
    }
  }

  private async performRequest<T>(
    request: GeminiRequest<T>
  ): Promise<GeminiResponse<T>> {
    const startTime = Date.now();
    const modelName = request.model ?? this.config.defaultModel;

    const fullPrompt = `${request.systemInstruction || ""}\n\nContext: ${request.context || "N/A"}\n\nPrompt: ${request.prompt}`;

    // Generation config with reasonable defaults
    const finalConfig = {
      temperature: request.temperature ?? 0.9,
      maxOutputTokens: request.maxTokens ?? 48192,
    };

    logger.info(`[Gemini Service] Generating content with model ${modelName}`, {
      tokenLimit: finalConfig.maxOutputTokens,
      temperature: finalConfig.temperature,
    });

    const result = await this.ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: finalConfig,
    });

    const text = result.text || '';

    const usage = {
      promptTokens: Math.ceil(fullPrompt.length / 4),
      completionTokens: Math.ceil(text.length / 4),
      totalTokens: Math.ceil((fullPrompt.length + text.length) / 4),
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
    // Try to parse JSON
    let parsed: any = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch (e2) {
          // Fall through
        }
      }
    }

    if (parsed === null) {
      logger.warn(
        "Gemini response did not contain valid JSON payload. Using raw text fallback."
      );
      return { raw: responseText } as T;
    }

    const { validator, allowPartial, onPartialFallback } = request;

    // If validator is provided, validate the response
    if (validator) {
      if (validator(parsed)) {
        return parsed;
      }

      // If validation fails but partial results are allowed
      if (allowPartial && onPartialFallback) {
        const partial = onPartialFallback(parsed);
        if (partial !== undefined) {
          logger.warn(
            "Gemini response failed validation; returning partial payload."
          );
          return partial as T;
        }
      }

      logger.error(
        "Gemini response failed validation and no partial fallback available."
      );
      throw new Error("Gemini response failed validation.");
    }

    // If no validator, check if response is structured (object or array)
    if (parsed && (typeof parsed === 'object' || Array.isArray(parsed))) {
      return parsed as T;
    }

    // If not structured JSON, fall back to raw text
    logger.warn(
      "Gemini response JSON was not an object or array. Using raw text fallback."
    );
    return { raw: responseText } as T;
  }

  private async handleError<T>(
    error: unknown,
    request: GeminiRequest<T>
  ): Promise<never> {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to generate content with model ${request.model}`, {
      error: message,
    });
    throw error instanceof Error ? error : new Error(message);
  }
}

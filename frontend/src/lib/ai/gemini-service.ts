import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  throttleByModel,
  normalizeGenConfig,
  parseJsonLenient,
  toText,
  buildRawFallback,
  isStructuredJson,
  MAX_TOKENS_PER_USE,
  type ModelId,
} from "./gemini-core";

export enum GeminiModel {
  PRO = "gemini-2.0-flash-exp",
  FLASH = "gemini-2.0-flash-exp",
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
  }

  async generate<T>(request: GeminiRequest<T>): Promise<GeminiResponse<T>> {
    const primaryModel = request.model ?? this.config.defaultModel;

    try {
      return await this.performRequest<T>({ ...request, model: primaryModel });
    } catch (primaryError) {
      if (
        this.config.fallbackModel &&
        this.config.fallbackModel !== primaryModel
      ) {
        console.warn(
          "Primary Gemini model failed. Falling back to secondary model."
        );
        return this.performRequest<T>({
          ...request,
          model: this.config.fallbackModel,
        });
      }
      throw primaryError;
    }
  }

  private async performRequest<T>(
    request: GeminiRequest<T>
  ): Promise<GeminiResponse<T>> {
    const startTime = Date.now();
    const modelName = request.model ?? this.config.defaultModel;

    // Apply unified throttling from gemini-core
    await throttleByModel(modelName as ModelId);

    const model = this.genAI.getGenerativeModel({ model: modelName });

    const fullPrompt = `${request.systemInstruction || ""}\n\nContext: ${request.context || "N/A"}\n\nPrompt: ${request.prompt}`;

    // Get unified generation config with 48192 token limit
    const genConfig = normalizeGenConfig();

    // Allow override of temperature and max tokens if specified
    const finalConfig = {
      ...genConfig,
      temperature: request.temperature ?? genConfig.temperature,
      maxOutputTokens: request.maxTokens ?? MAX_TOKENS_PER_USE,
    };

    console.log(`[Gemini Service] Generating content with model ${modelName}`, {
      tokenLimit: finalConfig.maxOutputTokens,
      temperature: finalConfig.temperature,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: finalConfig,
    });

    const response = result.response;
    const text = response.text();

    const usage = {
      promptTokens: Math.ceil(fullPrompt.length / 4),
      completionTokens: Math.ceil(text.length / 4),
      totalTokens: Math.ceil((fullPrompt.length + text.length) / 4),
    };

    return {
      model: modelName,
      content: this.parseResponse<T>(text),
      usage,
      metadata: {
        timestamp: new Date(),
        latency: Date.now() - startTime,
      },
    };
  }

  private parseResponse<T>(responseText: string): T {
    // Use unified lenient JSON parser from gemini-core
    const parsed = parseJsonLenient(responseText);

    if (parsed !== null && isStructuredJson(parsed)) {
      return parsed as T;
    }

    // If parsing failed or result is not structured, return raw fallback
    console.warn(
      "[Gemini Service] Response was not valid JSON, using raw text fallback"
    );
    return buildRawFallback<T>(responseText);
  }
}

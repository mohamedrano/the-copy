import { GoogleGenerativeAI } from '@google/generative-ai';

export enum GeminiModel {
  PRO = 'gemini-2.0-flash-exp',
  FLASH = 'gemini-2.0-flash-exp',
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
      if (this.config.fallbackModel && this.config.fallbackModel !== primaryModel) {
        console.warn('Primary Gemini model failed. Falling back to secondary model.');
        return this.performRequest<T>({ ...request, model: this.config.fallbackModel });
      }
      throw primaryError;
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
    const parseResult = this.extractJsonPayload(responseText);
    
    if (parseResult.success && parseResult.value !== undefined) {
      return parseResult.value as T;
    }
    
    return { raw: responseText } as unknown as T;
  }

  private extractJsonPayload(responseText: string): {
    success: boolean;
    value?: unknown;
  } {
    const fencedMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const candidate = fencedMatch?.[1] ?? responseText;

    try {
      return {
        success: true,
        value: JSON.parse(candidate),
      };
    } catch (error) {
      try {
        const repaired = this.repairTruncatedJson(candidate);
        if (repaired) {
          return {
            success: true,
            value: JSON.parse(repaired),
          };
        }
      } catch (repairError) {
        // Fall through to return failure
      }
      return { success: false };
    }
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
}
import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
} from "@google/generative-ai";
import { logger } from "../../utils/logger";
import {
  GeminiConfig,
  GeminiResponse,
  GeminiError,
} from "../../types/gemini.types";

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GeminiConfig;

  constructor(apiKey: string, config: Partial<GeminiConfig> = {}) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.config = {
      model: "gemini-2.0-flash-exp",
      temperature: 0.7,
      maxTokens: 40000,
      topP: 0.8,
      topK: 40,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    };

    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      } as GenerationConfig,
    });
  }

  async generate(
    prompt: string,
    options: Partial<GeminiConfig> = {},
  ): Promise<GeminiResponse> {
    const startTime = Date.now();
    const config = { ...this.config, ...options };

    try {
      logger.info("Starting Gemini generation", {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        promptLength: prompt.length,
      });

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const duration = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + text);

      logger.info("Gemini generation completed", {
        duration,
        tokensUsed,
        responseLength: text.length,
      });

      return {
        text,
        tokensUsed,
        duration,
        model: config.model,
        success: true,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error("Gemini generation failed", {
        error: error.message,
        duration,
        model: config.model,
      });

      throw new GeminiError(
        error.message || "Gemini API error",
        error.code || "GEMINI_ERROR",
        duration,
      );
    }
  }

  async *generateStream(
    prompt: string,
    options: Partial<GeminiConfig> = {},
  ): AsyncGenerator<GeminiResponse, void, unknown> {
    const config = { ...this.config, ...options };

    try {
      logger.info("Starting Gemini stream generation", {
        model: config.model,
        temperature: config.temperature,
        promptLength: prompt.length,
      });

      const result = await this.model.generateContentStream(prompt);
      let fullText = "";
      let tokensUsed = 0;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        tokensUsed += this.estimateTokens(chunkText);

        yield {
          text: chunkText,
          tokensUsed: this.estimateTokens(chunkText),
          duration: 0,
          model: config.model,
          success: true,
          isStreaming: true,
        };
      }

      logger.info("Gemini stream generation completed", {
        totalTokens: tokensUsed,
        totalLength: fullText.length,
      });
    } catch (error: any) {
      logger.error("Gemini stream generation failed", {
        error: error.message,
        model: config.model,
      });

      throw new GeminiError(
        error.message || "Gemini stream error",
        error.code || "GEMINI_STREAM_ERROR",
        0,
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = "Hello, please respond with 'Connection successful'";
      const response = await this.generate(testPrompt, { maxTokens: 10 });

      logger.info("Gemini connection test successful");
      return response.success;
    } catch (error) {
      logger.error("Gemini connection test failed", { error });
      return false;
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    // For Arabic, it might be slightly different
    return Math.ceil(text.length / 4);
  }

  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      } as GenerationConfig,
    });

    logger.info("Gemini client config updated", { config: this.config });
  }

  getConfig(): GeminiConfig {
    return { ...this.config };
  }
}

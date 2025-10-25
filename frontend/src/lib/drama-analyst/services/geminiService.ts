import { GoogleGenAI } from "@google/genai";
import { AIRequest, AIResponse, Result } from "../core/types";
import { buildPrompt } from "../orchestration/promptBuilder";
import { config } from "../config/environment";
import { sanitization } from "./sanitizationService";
import { log } from "./loggerService";
import {
  throttleByModel,
  normalizeGenConfig,
  parseJsonLenient,
  buildRawFallback,
  isStructuredJson,
  MAX_TOKENS_PER_USE,
  type ModelId,
} from "../../ai/gemini-core";

// =====================================================
// Gemini Service Configuration
// =====================================================

interface GeminiConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

class GeminiService {
  private config: GeminiConfig;
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.config = {
      apiKey: config.api.geminiKey,
      model: config.api.geminiModel,
      maxRetries: config.api.retries,
      retryDelay: 1000,
      timeout: config.api.timeout,
    };

    if (this.config.apiKey) {
      this.initialize();
    }
  }

  private initialize(): void {
    try {
      this.ai = new GoogleGenAI({ apiKey: this.config.apiKey });
      log.info("✅ Gemini API initialized successfully", null, "GeminiService");
    } catch (error) {
      log.error("❌ Failed to initialize Gemini", error, "GeminiService");
      throw error;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error(
        "Gemini model not initialized. Please check your API key."
      );
    }

    // Apply unified throttling from gemini-core
    await throttleByModel(this.config.model as ModelId);

    // Get unified generation config with 48192 token limit
    const genConfig = normalizeGenConfig();

    log.info(
      `[Gemini Service] Generating content with model ${this.config.model}`,
      {
        tokenLimit: genConfig.maxOutputTokens,
        temperature: genConfig.temperature,
      },
      "GeminiService"
    );

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        log.debug(
          `🔄 Gemini API call attempt ${attempt}/${this.config.maxRetries}`,
          null,
          "GeminiService"
        );

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Request timeout")),
            this.config.timeout
          );
        });

        const generatePromise = this.ai.models.generateContent({
          model: this.config.model,
          contents: prompt,
          config: {
            temperature: genConfig.temperature,
            maxOutputTokens: MAX_TOKENS_PER_USE,
          },
        });

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const text = result.text;

        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        log.info("✅ Gemini API call successful", null, "GeminiService");
        return text;
      } catch (error: any) {
        lastError = error;
        log.error(
          `❌ Gemini API error (attempt ${attempt})`,
          error,
          "GeminiService"
        );

        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * attempt;
          log.debug(`⏳ Retrying in ${delay}ms...`, null, "GeminiService");
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Gemini API failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  async analyze(request: AIRequest): Promise<AIResponse> {
    try {
      log.info(
        "📝 Starting Gemini analysis",
        { phase: request.phase },
        "GeminiService"
      );

      // Sanitize input
      const sanitized = sanitization.sanitizeInput(request.text);

      // Build prompt
      const prompt = buildPrompt(request.phase, sanitized, request.context);

      // Generate content
      const rawResponse = await this.generateContent(prompt);

      // Parse response with lenient JSON parsing from gemini-core
      const parsed = parseJsonLenient(rawResponse);

      let result: Result;

      if (parsed !== null && isStructuredJson(parsed)) {
        // Valid structured response
        result = {
          success: true,
          data: parsed,
          metadata: {
            phase: request.phase,
            timestamp: new Date().toISOString(),
            model: this.config.model,
          },
        };
      } else {
        // Fall back to raw text response
        log.warn(
          "⚠️ Gemini response was not valid JSON, using raw text fallback",
          null,
          "GeminiService"
        );
        result = {
          success: true,
          data: buildRawFallback(rawResponse),
          metadata: {
            phase: request.phase,
            timestamp: new Date().toISOString(),
            model: this.config.model,
            warning: "Response was not valid JSON",
          },
        };
      }

      log.info(
        "✅ Gemini analysis completed",
        { phase: request.phase },
        "GeminiService"
      );

      return {
        result,
        rawResponse,
      };
    } catch (error) {
      log.error("❌ Gemini analysis failed", error, "GeminiService");
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.ai !== null;
  }

  getModelInfo(): { model: string; maxTokens: number } {
    return {
      model: this.config.model,
      maxTokens: MAX_TOKENS_PER_USE,
    };
  }
}

// =====================================================
// Singleton Export
// =====================================================

export const geminiService = new GeminiService();
export default geminiService;

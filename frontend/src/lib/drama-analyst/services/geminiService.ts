import { GoogleGenAI } from '@google/genai';
import { AIRequest, AIResponse, Result } from '../core/types';
import { buildPrompt } from '../orchestration/promptBuilder';
import { config } from '../config/environment';
import { sanitization } from './sanitizationService';
import { log } from './loggerService';

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
      log.info('✅ Gemini API initialized successfully', null, 'GeminiService');
    } catch (error) {
      log.error('❌ Failed to initialize Gemini', error, 'GeminiService');
      throw error;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini model not initialized. Please check your API key.');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        log.debug(`🔄 Gemini API call attempt ${attempt}/${this.config.maxRetries}`, null, 'GeminiService');

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeout);
        });

        const generatePromise = this.ai.models.generateContent({
          model: this.config.model,
          contents: prompt,
          config: {
            temperature: 0.9,
            maxOutputTokens: 8192,
          }
        });

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const text = result.text;

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        log.info('✅ Gemini API call successful', null, 'GeminiService');
        return text;

      } catch (error: any) {
        lastError = error;
        log.error(`❌ Gemini API error (attempt ${attempt})`, error, 'GeminiService');

        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * attempt;
          log.debug(`⏳ Retrying in ${delay}ms...`, null, 'GeminiService');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Gemini API failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }
}

// Singleton instance
const geminiService = new GeminiService();

// =====================================================
// Public API
// =====================================================

export async function callModel(req: AIRequest): Promise<Result<AIResponse>> {
  try {
    // Sanitize request before processing
    const sanitizedReq = sanitization.aiRequest(req);
    const prompt = buildPrompt(sanitizedReq);

    log.info('📤 Sending request to Gemini...', null, 'GeminiService');
    const raw = await geminiService.generateContent(prompt);

    const res: AIResponse = {
      agent: sanitizedReq.agent,
      raw: sanitization.html(raw), // Sanitize the raw response
      meta: {
        provider: 'gemini',
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp',
        timestamp: new Date().toISOString()
      }
    };

    return { ok: true, value: res };
  } catch (e: any) {
    log.error('❌ Model call failed', e, 'GeminiService');

    let userMessage = 'فشل الاتصال بخدمة الذكاء الاصطناعي';
    let errorCode = 'MODEL_CALL_FAILED';

    if (e.message?.includes('API key')) {
      userMessage = 'مفتاح API غير صالح أو مفقود. يرجى التحقق من إعدادات المشروع.';
      errorCode = 'INVALID_API_KEY';
    } else if (e.message?.includes('timeout')) {
      userMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
      errorCode = 'REQUEST_TIMEOUT';
    } else if (e.message?.includes('quota')) {
      userMessage = 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.';
      errorCode = 'QUOTA_EXCEEDED';
    }

    return {
      ok: false,
      error: {
        code: errorCode,
        message: userMessage,
        cause: e
      }
    };
  }
}
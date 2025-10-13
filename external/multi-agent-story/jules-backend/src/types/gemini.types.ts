// Gemini API Types
export interface GeminiConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed: number;
  duration: number;
  model: string;
  success: boolean;
  isStreaming?: boolean;
}

export class GeminiError extends Error {
  public code: string;
  public duration: number;

  constructor(message: string, code: string, duration: number) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
    this.duration = duration;
  }
}

export interface GeminiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export interface GeminiSafetySettings {
  category: string;
  threshold: string;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  safetySettings?: GeminiSafetySettings[];
}

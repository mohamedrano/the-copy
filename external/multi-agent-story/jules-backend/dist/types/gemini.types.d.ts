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
export declare class GeminiError extends Error {
    code: string;
    duration: number;
    constructor(message: string, code: string, duration: number);
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
//# sourceMappingURL=gemini.types.d.ts.map
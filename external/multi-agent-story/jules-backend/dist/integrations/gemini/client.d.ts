import { GeminiConfig, GeminiResponse } from '../../types/gemini.types';
export declare class GeminiClient {
    private genAI;
    private model;
    private config;
    constructor(apiKey: string, config?: Partial<GeminiConfig>);
    generate(prompt: string, options?: Partial<GeminiConfig>): Promise<GeminiResponse>;
    generateStream(prompt: string, options?: Partial<GeminiConfig>): AsyncGenerator<GeminiResponse, void, unknown>;
    testConnection(): Promise<boolean>;
    private estimateTokens;
    updateConfig(newConfig: Partial<GeminiConfig>): void;
    getConfig(): GeminiConfig;
}
//# sourceMappingURL=client.d.ts.map
import { GeminiClient } from './client';
import { GeminiConfig } from '../../types/gemini.types';
export declare class GeminiPool {
    private clients;
    private config;
    private maxClients;
    constructor(config: GeminiConfig);
    getClient(apiKey: string): Promise<GeminiClient>;
    removeClient(apiKey: string): Promise<void>;
    testAllClients(): Promise<Map<string, boolean>>;
    getPoolSize(): number;
    clearPool(): void;
    updateConfig(newConfig: Partial<GeminiConfig>): void;
}
//# sourceMappingURL=pool.d.ts.map
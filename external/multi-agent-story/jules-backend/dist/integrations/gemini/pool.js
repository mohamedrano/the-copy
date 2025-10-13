import { GeminiClient } from './client';
import { logger } from '../../utils/logger';
export class GeminiPool {
    clients = new Map();
    config;
    maxClients = 10;
    constructor(config) {
        this.config = config;
    }
    async getClient(apiKey) {
        if (this.clients.has(apiKey)) {
            return this.clients.get(apiKey);
        }
        if (this.clients.size >= this.maxClients) {
            // Remove oldest client if pool is full
            const firstKey = this.clients.keys().next().value;
            this.clients.delete(firstKey);
            logger.warn('Gemini pool is full, removing oldest client', { removedKey: firstKey });
        }
        const client = new GeminiClient(apiKey, this.config);
        this.clients.set(apiKey, client);
        logger.info('Created new Gemini client', {
            poolSize: this.clients.size,
            apiKey: apiKey.substring(0, 10) + '...'
        });
        return client;
    }
    async removeClient(apiKey) {
        if (this.clients.has(apiKey)) {
            this.clients.delete(apiKey);
            logger.info('Removed Gemini client from pool', {
                poolSize: this.clients.size,
                apiKey: apiKey.substring(0, 10) + '...'
            });
        }
    }
    async testAllClients() {
        const results = new Map();
        for (const [apiKey, client] of this.clients) {
            try {
                const isWorking = await client.testConnection();
                results.set(apiKey, isWorking);
            }
            catch (error) {
                logger.error('Client test failed', {
                    apiKey: apiKey.substring(0, 10) + '...',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                results.set(apiKey, false);
            }
        }
        return results;
    }
    getPoolSize() {
        return this.clients.size;
    }
    clearPool() {
        this.clients.clear();
        logger.info('Cleared Gemini client pool');
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Update all existing clients
        for (const client of this.clients.values()) {
            client.updateConfig(newConfig);
        }
        logger.info('Updated Gemini pool config', { config: this.config });
    }
}
//# sourceMappingURL=pool.js.map
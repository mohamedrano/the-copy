import { GeminiClient } from "./client";
import { GeminiConfig } from "../../types/gemini.types";
import { logger } from "../../utils/logger";

export class GeminiPool {
  private clients: Map<string, GeminiClient> = new Map();
  private config: GeminiConfig;
  private maxClients: number = 10;

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  async getClient(apiKey: string): Promise<GeminiClient> {
    if (this.clients.has(apiKey)) {
      return this.clients.get(apiKey)!;
    }

    if (this.clients.size >= this.maxClients) {
      // Remove oldest client if pool is full
      const firstKey = this.clients.keys().next().value;
      this.clients.delete(firstKey);
      logger.warn("Gemini pool is full, removing oldest client", {
        removedKey: firstKey,
      });
    }

    const client = new GeminiClient(apiKey, this.config);
    this.clients.set(apiKey, client);

    logger.info("Created new Gemini client", {
      poolSize: this.clients.size,
      apiKey: apiKey.substring(0, 10) + "...",
    });

    return client;
  }

  async removeClient(apiKey: string): Promise<void> {
    if (this.clients.has(apiKey)) {
      this.clients.delete(apiKey);
      logger.info("Removed Gemini client from pool", {
        poolSize: this.clients.size,
        apiKey: apiKey.substring(0, 10) + "...",
      });
    }
  }

  async testAllClients(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [apiKey, client] of this.clients) {
      try {
        const isWorking = await client.testConnection();
        results.set(apiKey, isWorking);
      } catch (error) {
        logger.error("Client test failed", {
          apiKey: apiKey.substring(0, 10) + "...",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        results.set(apiKey, false);
      }
    }

    return results;
  }

  getPoolSize(): number {
    return this.clients.size;
  }

  clearPool(): void {
    this.clients.clear();
    logger.info("Cleared Gemini client pool");
  }

  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update all existing clients
    for (const client of this.clients.values()) {
      client.updateConfig(newConfig);
    }

    logger.info("Updated Gemini pool config", { config: this.config });
  }
}

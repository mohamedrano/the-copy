/**
 * Lazily retrieves agent instruction payloads from the public assets folder
 * with robust caching and fallback handling for offline scenarios.
 */

interface InstructionSet {
  systemPrompt: string;
  instructions: string[];
  outputFormat?: Record<string, string>;
  examples?: Array<{ input: string; output: string }>;
  [key: string]: any;
}

class InstructionsLoader {
  private cache = new Map<string, InstructionSet>();
  private loadingPromises = new Map<string, Promise<InstructionSet>>();

  /**
   * Loads and caches the instruction set for the supplied agent identifier.
   *
   * @param agentId - The identifier of the agent whose instructions are needed.
   * @returns A promise that resolves with a validated {@link InstructionSet}.
   */
  async loadInstructions(agentId: string): Promise<InstructionSet> {
    // Check cache first
    if (this.cache.has(agentId)) {
      return this.cache.get(agentId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(agentId)) {
      return this.loadingPromises.get(agentId)!;
    }

    // Start loading
    const loadPromise = this.fetchInstructions(agentId);
    this.loadingPromises.set(agentId, loadPromise);

    try {
      const instructions = await loadPromise;
      this.cache.set(agentId, instructions);
      this.loadingPromises.delete(agentId);
      return instructions;
    } catch (error) {
      this.loadingPromises.delete(agentId);
      throw error;
    }
  }

  /**
   * Retrieves an instruction file from the server and performs schema validation.
   *
   * @param agentId - Identifier of the agent whose instructions should be fetched.
   * @returns A promise resolving with validated instruction data.
   */
  private async fetchInstructions(agentId: string): Promise<InstructionSet> {
    try {
      const response = await fetch(`/instructions/${agentId}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load instructions for ${agentId}: ${response.statusText}`);
      }

      const instructions = await response.json();
      return this.validateInstructions(instructions);
    } catch (error) {
      console.warn(`Failed to load instructions for ${agentId}, using fallback`);
      return this.getFallbackInstructions(agentId);
    }
  }

  /**
   * Verifies that a fetched payload satisfies the expected instruction contract.
   *
   * @param instructions - Raw JSON loaded from disk.
   * @returns A strongly-typed {@link InstructionSet} when validation succeeds.
   * @throws {Error} When the payload is missing required fields.
   */
  private validateInstructions(instructions: any): InstructionSet {
    if (!instructions.systemPrompt || !Array.isArray(instructions.instructions)) {
      throw new Error('Invalid instruction format');
    }
    return instructions;
  }

  /**
   * Generates a localized default instruction set whenever fetching fails.
   *
   * @param agentId - Identifier used to personalize the fallback prompt.
   * @returns A minimal yet functional {@link InstructionSet} instance.
   */
  private getFallbackInstructions(agentId: string): InstructionSet {
    return {
      systemPrompt: `أنت وكيل ذكي متخصص في ${agentId}. قم بتحليل المحتوى المقدم وقدم رؤى مفيدة.`,
      instructions: [
        'حلل المحتوى المقدم بعناية',
        'قدم رؤى مفيدة وقابلة للتطبيق',
        'حافظ على الجودة والدقة في التحليل'
      ],
      outputFormat: {
        analysis: 'التحليل الأساسي',
        recommendations: 'التوصيات'
      }
    };
  }

  /**
   * Preloads and caches instruction files for a batch of agent identifiers.
   *
   * @param agentIds - Collection of agent IDs to resolve in parallel.
   * @returns A promise that resolves when all preload operations settle.
   */
  async preloadInstructions(agentIds: string[]): Promise<void> {
    const promises = agentIds.map(id => this.loadInstructions(id));
    await Promise.allSettled(promises);
  }

  /**
   * Clears both the resolved cache and any inflight load promises.
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Summarizes the loader's cache state for debugging and monitoring.
   *
   * @returns An object containing cached and currently loading agent IDs.
   */
  getCacheStatus(): { cached: string[]; loading: string[] } {
    return {
      cached: Array.from(this.cache.keys()),
      loading: Array.from(this.loadingPromises.keys())
    };
  }
}

// Singleton instance
export const instructionsLoader = new InstructionsLoader();

// Export types
export type { InstructionSet };
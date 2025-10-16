/**
 * Coordinates lazy loading and caching of agent instruction JSON payloads
 * so that feature modules can fetch structured prompts on demand.
 */

import { instructionsLoader, type InstructionSet } from './instructions-loader';

export class AgentInstructionsService {
  private static instance: AgentInstructionsService;
  
  private constructor() {}
  
  /**
   * Provides a lazily-instantiated singleton instance that may be reused
   * anywhere in the front-end runtime.
   *
   * @returns The shared {@link AgentInstructionsService} instance.
   */
  static getInstance(): AgentInstructionsService {
    if (!AgentInstructionsService.instance) {
      AgentInstructionsService.instance = new AgentInstructionsService();
    }
    return AgentInstructionsService.instance;
  }

  /**
   * Loads the structured instruction set for a specific agent.
   *
   * @param agentId - Identifier of the agent whose instructions should load.
   * @returns A promise that resolves with the agent's {@link InstructionSet}.
   */
  async getInstructions(agentId: string): Promise<InstructionSet> {
    return await instructionsLoader.loadInstructions(agentId);
  }

  /**
   * Preloads and caches the instruction payloads for multiple agents at once.
   *
   * @param agentIds - Collection of agent identifiers to prefetch.
   * @returns A promise that settles when all instruction files are cached.
   */
  async preloadAgents(agentIds: string[]): Promise<void> {
    await instructionsLoader.preloadInstructions(agentIds);
  }

  /**
   * Reports the current cache state including cached agent identifiers and
   * pending load operations.
   *
   * @returns Metadata describing which agent instructions are cached.
   */
  getCacheStatus() {
    return instructionsLoader.getCacheStatus();
  }

  /**
   * Clears any previously cached instruction payloads to force subsequent
   * lookups to fetch fresh data.
   */
  clearCache(): void {
    instructionsLoader.clearCache();
  }

  /**
   * Loads an agent's instructions while gracefully handling failures.
   *
   * @param agentId - Identifier of the agent whose instructions are requested.
   * @returns The {@link InstructionSet} if loading succeeds or {@code null}
   * when an error occurs.
   */
  async safeGetInstructions(agentId: string): Promise<InstructionSet | null> {
    try {
      return await this.getInstructions(agentId);
    } catch (error) {
      console.error(`Failed to load instructions for agent ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Determines whether instruction content exists for a given agent.
   *
   * @param agentId - Identifier of the agent to check.
   * @returns {@code true} when the instruction file loads successfully.
   */
  async isAgentAvailable(agentId: string): Promise<boolean> {
    try {
      await this.getInstructions(agentId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists the set of agents whose instructions are already cached in memory.
   *
   * @returns Sorted agent identifiers pulled from the cache metadata.
   */
  getAvailableAgents(): string[] {
    const { cached } = this.getCacheStatus();
    return cached;
  }
}

// تصدير المثيل الوحيد
export const agentInstructions = AgentInstructionsService.getInstance();

// تصدير الأنواع
export type { InstructionSet };
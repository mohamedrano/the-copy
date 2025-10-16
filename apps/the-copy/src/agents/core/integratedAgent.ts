import { GeminiService } from './geminiService';
import type { AgentConfig } from '../../config/agents';
import { agentsConfig } from '../../config/agents';
import { TaskCategory, TaskType } from '../../types/types';
import type { AIAgentConfig } from '../../types/types';

/**
 * Base class shared by specialized agents that encapsulates Gemini service
 * wiring and exposes a common execution contract.
 */
export class IntegratedAgent {
  protected geminiService: GeminiService;
  protected config: AgentConfig;
  protected agentConfig: AIAgentConfig;

  /**
   * Creates an agent instance bound to a specific configuration and API key.
   *
   * @param agentConfig - Declarative agent configuration metadata.
   * @param apiKey - Google Gemini API key used for downstream requests.
   */
  constructor(agentConfig: AIAgentConfig, apiKey: string) {
    this.agentConfig = agentConfig;
    this.config = agentsConfig[agentConfig.id || 'default'] || agentsConfig.default;
    this.geminiService = new GeminiService(apiKey, this.config);
  }

  /**
   * Template method that child classes must implement to trigger their
   * specialized Gemini interactions.
   *
   * @param args - Arbitrary arguments defined by subclasses.
   * @returns A promise resolving with agent-specific output.
   */
  public async execute(...args: any[]): Promise<any> {
    // This is a base method that should be overridden by subclasses
    throw new Error("Method 'execute()' must be implemented.");
  }
}


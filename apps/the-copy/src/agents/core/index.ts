/**
 * @file Agents Facade - Central hub for all agent configurations
 * Provides a unified interface for accessing AI agents while avoiding broken imports
 * 
 * @public
 */

import type { AIAgentConfig } from '../../types/types';

/**
 * Agent categories for organization and classification.
 * 
 * This enum defines the main functional categories that agents can belong to,
 * helping with organization, filtering, and presentation of available agents.
 * 
 * @public
 * @enum {string}
 */
export enum AgentCategory {
  /** Core system agents that provide foundational functionality. */
  CORE = 'core',
  /** Analysis agents that examine and analyze content. */
  ANALYSIS = 'analysis', 
  /** Generation agents that create new content. */
  GENERATION = 'generation',
  /** Transformation agents that modify existing content. */
  TRANSFORMATION = 'transformation',
  /** Evaluation agents that assess quality and performance. */
  EVALUATION = 'evaluation'
}

/**
 * Simplified agent configuration factory function.
 * 
 * This internal function creates standardized agent configurations with default
 * capabilities and settings, reducing boilerplate in agent definition.
 * 
 * @param id - Unique identifier for the agent.
 * @param name - Display name for the agent.
 * @param category - Category the agent belongs to.
 * @param description - Description of the agent's purpose.
 * @returns Complete agent configuration object.
 * 
 * @internal
 */
function createAgentConfig(id: string, name: string, category: AgentCategory, description: string): AIAgentConfig {
  return {
    id,
    name,
    description,
    category: category as any,
    capabilities: {
      multiModal: false,
      reasoningChains: true,
      toolUse: true,
      memorySystem: true,
      selfReflection: true,
      ragEnabled: true,
      vectorSearch: false,
      agentOrchestration: false,
      metacognitive: false,
      adaptiveLearning: true,
      contextualMemory: true,
      crossModalReasoning: false,
      temporalReasoning: true,
      causalReasoning: true,
      analogicalReasoning: true,
      creativeGeneration: true,
      criticalAnalysis: true,
      emotionalIntelligence: true
    },
    modelConfig: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1
    },
    systemPrompt: `You are ${name}, ${description}`,
    userPrompt: '',
    expectedOutput: 'Structured analysis and recommendations',
    processingInstructions: 'Process input systematically and provide actionable insights',
    qualityGates: ['accuracy', 'relevance', 'completeness'],
    fallbackBehavior: 'Provide best-effort analysis with confidence indicators',
    confidenceThreshold: 0.7
  };
}

/**
 * Available agents configuration registry.
 * 
 * This constant contains all configured AI agents in the system, providing
 * a centralized registry for agent discovery and management. The array is
 * frozen to prevent accidental modifications.
 * 
 * @public
 * @readonly
 */
export const AGENT_CONFIGS = Object.freeze<AIAgentConfig[]>([
  // Core Agents
  createAgentConfig('analysis', 'محلل السيناريو', AgentCategory.ANALYSIS, 'يحلل بنية السيناريو والشخصيات'),
  createAgentConfig('creative', 'المساعد الإبداعي', AgentCategory.GENERATION, 'يساعد في التوليد الإبداعي للمحتوى'),
  createAgentConfig('integrated', 'الوكيل المتكامل', AgentCategory.CORE, 'ينسق بين جميع الوكلاء الأخرى'),
  
  // Analysis Agents
  createAgentConfig('character-analyzer', 'محلل الشخصيات', AgentCategory.ANALYSIS, 'يحلل تطوير الشخصيات وأصواتها'),
  createAgentConfig('dialogue-forensics', 'محلل الحوار', AgentCategory.ANALYSIS, 'يحلل جودة وأصالة الحوار'),
  createAgentConfig('rhythm-mapping', 'محلل الإيقاع', AgentCategory.ANALYSIS, 'يحلل إيقاع السرد والتوتر'),
  createAgentConfig('cultural-analyzer', 'المحلل الثقافي', AgentCategory.ANALYSIS, 'يحلل السياق الثقافي والتاريخي'),
  
  // Generation Agents
  createAgentConfig('scene-generator', 'مولد المشاهد', AgentCategory.GENERATION, 'ينشئ مشاهد جديدة'),
  createAgentConfig('completion', 'مكمل النصوص', AgentCategory.GENERATION, 'يكمل النصوص الناقصة'),
  createAgentConfig('world-builder', 'باني العوالم', AgentCategory.GENERATION, 'يطور عوالم السيناريو'),
  
  // Transformation Agents
  createAgentConfig('adaptive-rewriting', 'معيد الكتابة', AgentCategory.TRANSFORMATION, 'يعيد كتابة النصوص بأساليب مختلفة'),
  createAgentConfig('platform-adapter', 'محول المنصات', AgentCategory.TRANSFORMATION, 'يكيف المحتوى للمنصات المختلفة'),
  
  // Evaluation Agents
  createAgentConfig('audience-resonance', 'محلل الجمهور', AgentCategory.EVALUATION, 'يقيم صدى المحتوى مع الجمهور'),
  createAgentConfig('tension-optimizer', 'محسن التوتر', AgentCategory.EVALUATION, 'يحسن مستويات التوتر الدرامي')
]);

/**
 * Returns every configured agent that belongs to the specified category.
 * 
 * This function filters the agent registry to return only agents that match
 * the specified category, enabling category-based agent discovery and management.
 *
 * @param category - Logical grouping of agents, e.g. analysis or generation.
 * @returns An array of {@link AIAgentConfig} entries matching the category.
 * 
 * @example
 * ```typescript
 * const analysisAgents = getAgentsByCategory(AgentCategory.ANALYSIS);
 * console.log(`Found ${analysisAgents.length} analysis agents`);
 * ```
 * 
 * @public
 */
export function getAgentsByCategory(category: AgentCategory): AIAgentConfig[] {
  return AGENT_CONFIGS.filter(agent => agent.category === category);
}

/**
 * Looks up a single agent configuration using its unique identifier.
 * 
 * This function searches the agent registry for an agent with the specified ID,
 * returning the configuration if found or undefined if not present.
 *
 * @param id - Identifier assigned to the desired agent.
 * @returns The matching {@link AIAgentConfig} or {@code undefined} if absent.
 * 
 * @example
 * ```typescript
 * const agent = getAgentById('analysis');
 * if (agent) {
 *   console.log(`Found agent: ${agent.name}`);
 * }
 * ```
 * 
 * @public
 */
export function getAgentById(id: string): AIAgentConfig | undefined {
  return AGENT_CONFIGS.find(agent => agent.id === id);
}

/**
 * Agent execution interface for running AI agents.
 * 
 * This interface defines the contract for executing AI agents, providing
 * a standardized way to run agents with input and context.
 * 
 * @public
 * @property execute - Method to execute an agent with given input and context.
 */
export interface AgentExecutor {
  /**
   * Executes an agent with the specified input and optional context.
   * 
   * @param agentId - The unique identifier of the agent to execute.
   * @param input - The input data to process.
   * @param context - Optional contextual information for the agent.
   * @returns Promise resolving to the agent's output.
   */
  execute(agentId: string, input: string, context?: any): Promise<any>;
}

/**
 * Minimal executor implementation that assembles prompts using dynamically
 * loaded instruction sets prior to dispatching work to the selected agent.
 * 
 * This class provides a basic implementation of the AgentExecutor interface,
 * handling agent execution with dynamic instruction loading and fallback behavior.
 * 
 * @public
 * @implements {AgentExecutor}
 */
export class SimpleAgentExecutor implements AgentExecutor {
  /**
   * Generates an enriched prompt for the requested agent and returns a mocked
   * execution result. If instruction loading fails the response includes a
   * degraded fallback message.
   * 
   * This method handles the complete agent execution workflow, including
   * instruction loading, prompt assembly, and result generation with
   * appropriate error handling and fallback behavior.
   *
   * @param agentId - Identifier of the agent that should process the input.
   * @param input - Raw user input passed to the agent.
   * @param context - Optional contextual metadata consumed by advanced agents.
   * @returns A promise resolving with synthetic execution metadata and output.
   * 
   * @throws {Error} When the specified agent ID is not found in the registry.
   * 
   * @example
   * ```typescript
   * const executor = new SimpleAgentExecutor();
   * const result = await executor.execute('analysis', 'Analyze this screenplay');
   * console.log(result.output);
   * ```
   * 
   * @public
   */
  async execute(agentId: string, input: string, context?: any): Promise<any> {
    const agent = getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    try {
      // Load instructions dynamically
      const { instructionsLoader } = await import('../../services/instructions-loader');
      const instructions = await instructionsLoader.loadInstructions(agentId);
      
      // Enhanced processing with loaded instructions
      const enhancedPrompt = `${instructions.systemPrompt}\n\nالمهام:\n${instructions.instructions.join('\n')}\n\nالمدخل: ${input}`;
      
      return {
        agentId,
        input,
        prompt: enhancedPrompt,
        output: `تحليل محسن من ${agent.name}: ${input}`,
        instructions: instructions.instructions,
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Fallback to basic processing
      console.warn(`Failed to load instructions for ${agentId}:`, error);
      return {
        agentId,
        input,
        output: `تحليل أساسي من ${agent.name}: ${input}`,
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        error: 'Instructions loading failed, using fallback'
      };
    }
  }
}

// Export instruction loader for external use

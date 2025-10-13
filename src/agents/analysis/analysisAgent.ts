import { IntegratedAgent } from '../core/integratedAgent';
import type { AIAgentConfig, ProcessedFile } from '../../types/types';
import { TaskType, TaskCategory } from '../../types/types';

const ANALYSIS_AGENT_CONFIG: AIAgentConfig = {
  id: 'analysis',
  name: 'محلل السيناريو',
  description: 'يحلل بنية السيناريو والشخصيات',
  category: TaskCategory.ANALYSIS,
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
    creativeGeneration: false,
    criticalAnalysis: true,
    emotionalIntelligence: true
  },
  modelConfig: {
    temperature: 0.3,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  systemPrompt: 'أنت محلل سيناريو متخصص في النصوص العربية',
  userPrompt: '',
  expectedOutput: 'تحليل مهيكل للسيناريو',
  processingInstructions: 'حلل النص بدقة وقدم رؤى مفيدة',
  qualityGates: ['accuracy', 'relevance', 'completeness'],
  fallbackBehavior: 'قدم تحليل أساسي مع مؤشرات الثقة',
  confidenceThreshold: 0.7
};

export { ANALYSIS_AGENT_CONFIG };

/**
 * Agent implementation responsible for baseline screenplay analytics.
 */
export class AnalysisAgent extends IntegratedAgent {
  /**
   * Creates an analysis agent preconfigured with the shared Gemini settings.
   *
   * @param apiKey - Google Gemini API key forwarded to the parent class.
   */
  constructor(apiKey: string) {
    super(ANALYSIS_AGENT_CONFIG, apiKey);
  }

  /**
   * Runs the primary analysis workflow by delegating to the Gemini service.
   *
   * @param files - Preprocessed screenplay files ready for prompt injection.
   * @param specialRequirements - Tailored guidance provided by the user.
   * @param additionalInfo - Supplemental context to improve AI output.
   * @returns A structured Gemini response object.
   */
  public async execute(
    files: ProcessedFile[],
    specialRequirements: string,
    additionalInfo: string
  ): Promise<any> {
    const result = await this.geminiService.processTextsWithGemini({
      processedFiles: files,
      taskType: TaskType.ANALYSIS,
      specialRequirements: specialRequirements,
      additionalInfo: additionalInfo,
    });

    return result;
  }
}
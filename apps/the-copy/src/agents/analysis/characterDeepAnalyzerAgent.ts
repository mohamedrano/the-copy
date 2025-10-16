import { IntegratedAgent } from '../core/integratedAgent';
import type { AIAgentConfig } from '../../types/types';
import { TaskType } from '../../types/types';
import { CHARACTER_DEEP_ANALYZER_AGENT_CONFIG } from './characterDeepAnalyzerConfig';
import type { ProcessedFile } from '../core/fileReaderService';

/**
 * Specialized agent that drives deep character analysis tasks through the
 * shared Gemini service wrapper.
 */
export class CharacterDeepAnalyzerAgent extends IntegratedAgent {
  /**
   * Creates a character analysis agent bound to the configured Gemini model.
   *
   * @param apiKey - Google Gemini API key forwarded to the base agent.
   */
  constructor(apiKey: string) {
    super(CHARACTER_DEEP_ANALYZER_AGENT_CONFIG, apiKey);
  }

  /**
   * Executes the character deep analysis workflow against the supplied files
   * and additional user guidance.
   *
   * @param files - Preprocessed screenplay materials for Gemini ingestion.
   * @param specialRequirements - User-defined directives to prioritize.
   * @param additionalInfo - Supplementary context for the AI assistant.
   * @returns The processed Gemini response payload.
   */
  public async execute(
    files: ProcessedFile[],
    specialRequirements: string,
    additionalInfo: string
  ): Promise<any> {
    const result = await this.geminiService.processTextsWithGemini({
      processedFiles: files,
      taskType: TaskType.CHARACTER_DEEP_ANALYZER,
      specialRequirements: specialRequirements,
      additionalInfo: additionalInfo,
    });

    return result;
  }
}
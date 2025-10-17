import type { Script } from '../types/types';

/**
 * Statistical data about a character's dialogue participation in a screenplay.
 * 
 * @public
 * @property name - The character's canonical name as it appears in the script.
 * @property dialogueLines - Total count of dialogue lines spoken by this character.
 */
export interface CharacterDialogueStat {
  /** The character's canonical name as it appears in the script. */
  name: string;
  /** Total count of dialogue lines spoken by this character. */
  dialogueLines: number;
}

/**
 * Comprehensive analysis result containing both quantitative metrics and AI-generated qualitative insights.
 * 
 * @public
 * @property totalScenes - Number of scenes identified in the screenplay.
 * @property characterDialogueCounts - Array of dialogue statistics for each character.
 * @property dialogueToActionRatio - Ratio of dialogue lines to action lines (0-1 scale).
 * @property synopsis - AI-generated synopsis of the screenplay.
 * @property logline - AI-generated one-sentence logline summarizing the story.
 */
export interface AnalysisResult {
  /** Number of scenes identified in the screenplay. */
  totalScenes: number;
  /** Array of dialogue statistics for each character. */
  characterDialogueCounts: CharacterDialogueStat[];
  /** Ratio of dialogue lines to action lines (0-1 scale). */
  dialogueToActionRatio: number;
  /** AI-generated synopsis of the screenplay. */
  synopsis: string;
  /** AI-generated one-sentence logline summarizing the story. */
  logline: string;
}

/**
 * Interface for AI text generation services used by the analysis service.
 * 
 * @public
 * @property generateText - Method to generate text using AI with given prompt and context.
 */
export interface AIWritingAssistantLike {
  /**
   * Generates text using AI based on a prompt and context.
   * 
   * @param prompt - The text prompt to send to the AI service.
   * @param context - Additional context to inform the AI's response.
   * @param options - Optional configuration parameters for the AI service.
   * @returns Promise resolving to an object containing the generated text.
   */
  generateText: (
    prompt: string,
    context: string,
    options?: Record<string, unknown>
  ) => Promise<{ text?: string }>;
}

/**
 * Core analytics service for Arabic screenplay analysis and AI-driven insights generation.
 * 
 * This service provides comprehensive analysis capabilities for screenplays, including
 * structural metrics calculation, character dialogue analysis, and AI-generated qualitative
 * insights such as synopses and loglines. It serves as the primary analysis engine
 * for the Naqid MVP dashboard.
 * 
 * @remarks
 * The service combines quantitative analysis of screenplay structure with qualitative
 * AI-generated content. It requires an AI assistant implementation to generate
 * synopses and loglines, making it flexible to work with different AI providers.
 * 
 * @example
 * ```typescript
 * import AnalysisService from './services/AnalysisService';
 * import { GeminiService } from './lib/ai/geminiService';
 * 
 * const aiAssistant = new GeminiService();
 * const analysisService = new AnalysisService(aiAssistant);
 * 
 * const result = await analysisService.analyze(script);
 * console.log(`Found ${result.totalScenes} scenes`);
 * ```
 * 
 * @public
 */
export default class AnalysisService {
  /** AI assistant instance used for generating qualitative insights. */
  private readonly aiAssistant: AIWritingAssistantLike;

  /**
   * Creates a new analysis service instance bound to a specific AI assistant.
   * 
   * @param aiAssistant - AI service implementation for generating qualitative insights.
   * Must implement the {@link AIWritingAssistantLike} interface.
   * 
   * @example
   * ```typescript
   * const service = new AnalysisService(new GeminiService());
   * ```
   */
  constructor(aiAssistant: AIWritingAssistantLike) {
    this.aiAssistant = aiAssistant;
  }

  /**
   * Performs comprehensive analysis of a screenplay, generating both quantitative metrics and qualitative insights.
   * 
   * This method analyzes the screenplay structure, calculates character dialogue statistics,
   * determines dialogue-to-action ratios, and uses AI to generate synopsis and logline.
   * 
   * @param script - Structured screenplay data containing scenes, characters, and dialogue information.
   * @param rawTextOverride - Optional raw text override for AI generation contexts.
   * If provided, this text will be used instead of the script's stored raw text for AI analysis.
   * 
   * @returns Promise resolving to comprehensive analysis results including metrics and AI-generated insights.
   * 
   * @throws {Error} When AI assistant fails to generate qualitative content.
   * 
   * @example
   * ```typescript
   * const result = await analysisService.analyze(script);
   * console.log(`Dialogue ratio: ${result.dialogueToActionRatio}`);
   * console.log(`Synopsis: ${result.synopsis}`);
   * ```
   * 
   * @public
   */
  async analyze(script: Script, rawTextOverride?: string): Promise<AnalysisResult> {
    const totalScenes = script.scenes.length;
    const characterDialogueCounts = Object.values(script.characters)
      .map<CharacterDialogueStat>((character) => ({
        name: character.name,
        dialogueLines: character.dialogueCount,
      }))
      .sort((a, b) => b.dialogueLines - a.dialogueLines);

    const totalDialogueLines = script.dialogueLines.length;
    const totalActionLines = script.scenes.reduce((sum, scene) => sum + scene.actionLines.length, 0);
    const dialogueToActionRatio = totalActionLines === 0
      ? totalDialogueLines
      : totalDialogueLines / totalActionLines;

    const narrativeSource = (rawTextOverride ?? script.rawText ?? '').trim();

    const [synopsis, logline] = await Promise.all([
      this.generateAiInsight(
        'استنادًا إلى هذا السيناريو، قم بتوليد ملخص من فقرة واحدة (Synopsis).',
        narrativeSource
      ),
      this.generateAiInsight(
        'استنادًا إلى هذا السيناريو، اقترح عنوانًا جذابًا (Logline).',
        narrativeSource
      ),
    ]);

    return {
      totalScenes,
      characterDialogueCounts,
      dialogueToActionRatio,
      synopsis,
      logline,
    };
  }

  /**
   * Generates AI-powered qualitative insights using the configured AI assistant.
   * 
   * This private method handles the AI text generation process, including error handling
   * and fallback responses. It's used internally by the analyze method to generate
   * synopses and loglines.
   * 
   * @param prompt - The specific prompt to send to the AI service for insight generation.
   * @param context - The screenplay text context to analyze.
   * @returns Promise resolving to the AI-generated insight text or a fallback message.
   * 
   * @remarks
   * If the context is empty or the AI service fails, appropriate fallback messages
   * in Arabic are returned to maintain user experience consistency.
   * 
   * @private
   */
  private async generateAiInsight(prompt: string, context: string): Promise<string> {
    if (!context) {
      return 'لم يتم توفير نص كافٍ لتحليل الذكاء الاصطناعي.';
    }

    try {
      const response = await this.aiAssistant.generateText(prompt, context, { mode: 'analysis' });
      return response.text ?? 'تعذر توليد الاستجابة بواسطة الذكاء الاصطناعي.';
    } catch (error) {
      console.error('AI insight generation failed:', error);
      return 'حدث خطأ أثناء توليد الاستجابة من الذكاء الاصطناعي.';
    }
  }
}

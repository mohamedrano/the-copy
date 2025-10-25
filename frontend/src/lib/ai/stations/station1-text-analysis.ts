import { BaseStation, type StationConfig } from '../core/pipeline/base-station';
import { GeminiService, GeminiModel } from './gemini-service';
import { toText, safeSub, safeSplit } from '@/lib/ai/gemini-core';

type MajorCharactersResponse = {
  major_characters?: string[];
  raw?: unknown;
};

type CharacterAnalysisResponse = {
  personality_traits?: string;
  motivations_goals?: string;
  key_relationships_brief?: string;
  narrative_function?: string;
  potential_arc_observation?: string;
  raw?: unknown;
};

type RelationshipAnalysisResponse = {
  key_relationships?: Array<{
    characters?: [string, string];
    dynamic?: string;
    narrative_importance?: string;
  }>;
  raw?: unknown;
};

type NarrativeStyleResponse = {
  overall_tone?: string;
  pacing_analysis?: string;
  language_style?: string;
  raw?: unknown;
};

export interface Station1Input {
  fullText: string;
  projectName: string;
  proseFilePath?: string;
}

export interface CharacterAnalysisResult {
  personalityTraits: string;
  motivationsGoals: string;
  keyRelationshipsBrief: string;
  narrativeFunction: string;
  potentialArcObservation: string;
}

export interface RelationshipAnalysisResult {
  keyRelationships: Array<{
    characters: [string, string];
    dynamic: string;
    narrativeImportance: string;
  }>;
}

export interface NarrativeStyleResult {
  overallTone: string;
  pacingAnalysis: string;
  languageStyle: string;
}

export interface Station1Output {
  majorCharacters: string[];
  characterAnalysis: Map<string, CharacterAnalysisResult>;
  relationshipAnalysis: RelationshipAnalysisResult;
  narrativeStyleAnalysis: NarrativeStyleResult;
  metadata: {
    analysisTimestamp: Date;
    status: 'Success' | 'Partial' | 'Failed';
  };
}

export class Station1TextAnalysis extends BaseStation<Station1Input, Station1Output> {
  
  constructor(
    config: StationConfig<Station1Input, Station1Output>,
    geminiService: GeminiService
  ) {
    super(config, geminiService);
  }

  protected async process(input: Station1Input): Promise<Station1Output> {
    const [
      majorCharacters,
      relationshipAnalysis,
      narrativeStyle
    ] = await Promise.all([
      this.identifyMajorCharacters(input.fullText),
      this.analyzeRelationships(input.fullText),
      this.analyzeNarrativeStyle(input.fullText)
    ]);

    const characterAnalysis = await this.analyzeCharactersInDepth(
      input.fullText,
      majorCharacters
    );

    return {
      majorCharacters,
      characterAnalysis,
      relationshipAnalysis,
      narrativeStyleAnalysis: narrativeStyle,
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Success'
      }
    };
  }

  private async identifyMajorCharacters(
    fullText: string
  ): Promise<string[]> {
    const prompt = `
بناءً على النص السردي الكامل المرفق، قم بتحليل النص وتحديد الشخصيات التي تبدو **الأكثر مركزية وأهمية** للحبكة وتطور الأحداث. 
ركز على الشخصيات التي لها أدوار فاعلة، دوافع واضحة، وتظهر بشكل متكرر ومؤثر.
اكتب قائمة بأسماء الشخصيات الرئيسية (ما بين 3 إلى 7 شخصيات)، كل اسم في سطر منفصل.
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(fullText, 0, 30000),
      model: GeminiModel.FLASH
    });

    const content = toText(result.content);
    return content ? safeSplit(content, '\n').filter(line => line.trim()) : [];
  }

  private async analyzeCharactersInDepth(
    fullText: string,
    characterNames: string[]
  ): Promise<Map<string, CharacterAnalysisResult>> {
    const analyses = new Map<string, CharacterAnalysisResult>();

    const analysisPromises = characterNames.map(name =>
      this.analyzeCharacter(fullText, name)
    );

    const results = await Promise.all(analysisPromises);

    characterNames.forEach((name, index) => {
      const result = results[index];
      if (result) {
        analyses.set(name, result);
      }
    });

    return analyses;
  }

  private async analyzeCharacter(
    fullText: string,
    characterName: string
  ): Promise<CharacterAnalysisResult> {
    const prompt = `
بناءً على النص السردي الكامل المرفق، قم بإجراء تحليل **شامل ومعمق** للشخصية: **${characterName}**.

اكتب تحليلاً مفصلاً يغطي:
1. السمات الشخصية البارزة
2. الدوافع والأهداف
3. العلاقات الرئيسية
4. الدور في القصة
5. قوس التطور
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(fullText, 0, 30000),
      model: GeminiModel.FLASH
    });

    return {
      personalityTraits: toText(result.content) || 'N/A',
      motivationsGoals: '',
      keyRelationshipsBrief: '',
      narrativeFunction: '',
      potentialArcObservation: ''
    };
  }

  private async analyzeRelationships(
    fullText: string
  ): Promise<RelationshipAnalysisResult> {
    const prompt = `
بناءً على النص السردي الكامل المرفق، قم بتحليل وتحديد **العلاقات الرئيسية** بين الشخصيات.
ركز على العلاقات التي لها تأثير واضح على الحبكة وتطور الأحداث.

اكتب تحليلاً مفصلاً للعلاقات الرئيسية.
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(fullText, 0, 30000),
      model: GeminiModel.FLASH
    });

    return {
      keyRelationships: [{
        characters: ['غير محدد', 'غير محدد'],
        dynamic: toText(result.content) || 'N/A',
        narrativeImportance: 'N/A'
      }]
    };
  }

  private async analyzeNarrativeStyle(
    fullText: string
  ): Promise<NarrativeStyleResult> {
    const prompt = `
بناءً على النص السردي الكامل المرفق، قم بتحليل **الأسلوب السردي** للنص.

اكتب تحليلاً مفصلاً يغطي:
1. النغمة الإجمالية للنص
2. تحليل وتيرة السرد
3. أسلوب اللغة المستخدمة
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(fullText, 0, 30000),
      model: GeminiModel.FLASH
    });

    return {
      overallTone: toText(result.content) || 'N/A',
      pacingAnalysis: '',
      languageStyle: ''
    };
  }

  protected extractRequiredData(input: Station1Input): Record<string, unknown> {
    return {
      fullTextLength: input.fullText.length,
      projectName: input.projectName,
      hasProseFilePath: Boolean(input.proseFilePath)
    };
  }

  protected getErrorFallback(): Station1Output {
    return {
      majorCharacters: [],
      characterAnalysis: new Map(),
      relationshipAnalysis: { keyRelationships: [] },
      narrativeStyleAnalysis: {
        overallTone: 'Error',
        pacingAnalysis: 'Error',
        languageStyle: 'Error'
      },
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Failed'
      }
    };
  }
}

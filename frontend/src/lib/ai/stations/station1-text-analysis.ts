import { BaseStation, type StationConfig } from '../core/pipeline/base-station';
import { GeminiService, GeminiModel } from './gemini-service';

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
أعد قائمة تتضمن **ما بين 3 إلى 7 شخصيات** تعتبرها الأكثر أهمية.

أعد الإجابة **حصرياً** بتنسيق JSON صالح:
{
  "major_characters": ["اسم الشخصية 1", "اسم الشخصية 2", ...]
}
    `;

    const result = await this.geminiService.generate<MajorCharactersResponse>({
      prompt,
      context: fullText.substring(0, 30000),
      model: GeminiModel.PRO
    });

    return result.content.major_characters ?? [];
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
بناءً على النص السردي الكامل المرفق، قم بإجراء تحليل **شامل ومعمق** للشخصية المحددة التالية: **${characterName}**.

المطلوب تحليل الجوانب التالية لهذه الشخصية:
1. السمات الشخصية البارزة (إيجابية وسلبية)
2. الدوافع الأساسية والأهداف (الظاهرة والخفية)
3. وصف موجز لأهم علاقاتها مع شخصيات أخرى
4. الدور أو الوظيفة الرئيسية في القصة
5. ملاحظات أولية حول قوس التطور المحتمل

أعد الإجابة **حصرياً** بتنسيق JSON صالح:
{
  "personality_traits": "...",
  "motivations_goals": "...",
  "key_relationships_brief": "...",
  "narrative_function": "...",
  "potential_arc_observation": "..."
}
    `;

    const result = await this.geminiService.generate<CharacterAnalysisResponse>({
      prompt,
      context: fullText.substring(0, 30000),
      model: GeminiModel.PRO
    });

    return {
      personalityTraits: result.content.personality_traits ?? 'N/A',
      motivationsGoals: result.content.motivations_goals ?? 'N/A',
      keyRelationshipsBrief: result.content.key_relationships_brief ?? 'N/A',
      narrativeFunction: result.content.narrative_function ?? 'N/A',
      potentialArcObservation: result.content.potential_arc_observation ?? 'N/A'
    };
  }

  private async analyzeRelationships(
    fullText: string
  ): Promise<RelationshipAnalysisResult> {
    const prompt = `
بناءً على النص السردي الكامل المرفق، قم بتحليل وتحديد **العلاقات الرئيسية** بين الشخصيات.
ركز على العلاقات التي لها تأثير واضح على الحبكة وتطور الأحداث.

أعد الإجابة **حصرياً** بتنسيق JSON صالح:
{
  "key_relationships": [
    {
      "characters": ["الشخصية 1", "الشخصية 2"],
      "dynamic": "وصف ديناميكية العلاقة",
      "narrative_importance": "أهمية العلاقة في السرد"
    }
  ]
}
    `;

    const result = await this.geminiService.generate<RelationshipAnalysisResponse>({
      prompt,
      context: fullText.substring(0, 30000),
      model: GeminiModel.PRO
    });

    return {
      keyRelationships: (result.content.key_relationships ?? []).map((rel) => ({
        characters: rel?.characters ?? ['غير معروف', 'غير معروف'],
        dynamic: rel?.dynamic ?? 'N/A',
        narrativeImportance: rel?.narrative_importance ?? 'N/A'
      }))
    };
  }

  private async analyzeNarrativeStyle(
    fullText: string
  ): Promise<NarrativeStyleResult> {
    const prompt = `
بناءً على النص السردي الكامل المرفق، قم بتحليل **الأسلوب السردي** للنص.

المطلوب تحليل:
1. النغمة الإجمالية للنص (درامي، كوميدي، تراجيدي، إلخ)
2. تحليل وتيرة السرد (سريع، بطيء، متنوع، إلخ)
3. أسلوب اللغة المستخدمة (رسمي، عامي، شاعري، إلخ)

أعد الإجابة **حصرياً** بتنسيق JSON صالح:
{
  "overall_tone": "...",
  "pacing_analysis": "...",
  "language_style": "..."
}
    `;

    const result = await this.geminiService.generate<NarrativeStyleResponse>({
      prompt,
      context: fullText.substring(0, 30000),
      model: GeminiModel.PRO
    });

    return {
      overallTone: result.content.overall_tone ?? 'N/A',
      pacingAnalysis: result.content.pacing_analysis ?? 'N/A',
      languageStyle: result.content.language_style ?? 'N/A'
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

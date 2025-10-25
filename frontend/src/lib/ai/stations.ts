import { GeminiService, GeminiModel } from './gemini-service';

export interface Station1Output {
  majorCharacters: string[];
  narrativeStyleAnalysis: {
    overallTone: string;
    pacingAnalysis: string;
    languageStyle: string;
  };
}

export interface Station2Output {
  storyStatement: string;
  hybridGenre: string;
}

export interface Station3Output {
  networkSummary: {
    charactersCount: number;
    relationshipsCount: number;
    conflictsCount: number;
  };
}

export interface Station4Output {
  efficiencyMetrics: {
    overallEfficiencyScore: number;
  };
  recommendations: {
    priorityActions: string[];
  };
}

export interface Station5Output {
  dynamicAnalysisResults: {
    characterDevelopmentTracking: {
      size: number;
    };
  };
}

export interface Station6Output {
  diagnosticsReport: {
    overallHealthScore: number;
    criticalIssues: Array<{
      description: string;
    }>;
  };
}

export interface Station7Output {
  finalReport: {
    executiveSummary: string;
  };
}

export class StationsAnalyzer {
  private geminiService: GeminiService;

  constructor(apiKey: string) {
    this.geminiService = new GeminiService({
      apiKey,
      defaultModel: GeminiModel.PRO,
      maxRetries: 3,
      timeout: 60000,
      fallbackModel: GeminiModel.FLASH,
    });
  }

  async runStation1(fullText: string): Promise<Station1Output> {
    const charactersPrompt = `
بناءً على النص السردي التالي، قم بتحديد الشخصيات الرئيسية (3-7 شخصيات):

أعد الإجابة بتنسيق JSON:
{
  "major_characters": ["اسم الشخصية 1", "اسم الشخصية 2"]
}
    `;

    const stylePrompt = `
قم بتحليل الأسلوب السردي للنص التالي:

أعد الإجابة بتنسيق JSON:
{
  "overall_tone": "النغمة الإجمالية",
  "pacing_analysis": "تحليل الوتيرة",
  "language_style": "أسلوب اللغة"
}
    `;

    const [charactersResult, styleResult] = await Promise.all([
      this.geminiService.generate<{ major_characters: string[] }>({
        prompt: charactersPrompt,
        context: fullText.substring(0, 30000),
      }),
      this.geminiService.generate<{
        overall_tone: string;
        pacing_analysis: string;
        language_style: string;
      }>({
        prompt: stylePrompt,
        context: fullText.substring(0, 30000),
      }),
    ]);

    return {
      majorCharacters: charactersResult.content.major_characters || [],
      narrativeStyleAnalysis: {
        overallTone: styleResult.content.overall_tone || 'غير محدد',
        pacingAnalysis: styleResult.content.pacing_analysis || 'غير محدد',
        languageStyle: styleResult.content.language_style || 'غير محدد',
      },
    };
  }

  async runStation2(fullText: string, station1Output: Station1Output): Promise<Station2Output> {
    const prompt = `
بناءً على النص والشخصيات المحددة، قم بتحديد:
1. بيان القصة الأساسي
2. النوع الأدبي الهجين

الشخصيات الرئيسية: ${station1Output.majorCharacters.join(', ')}

أعد الإجابة بتنسيق JSON:
{
  "story_statement": "بيان القصة",
  "hybrid_genre": "النوع الهجين"
}
    `;

    const result = await this.geminiService.generate<{
      story_statement: string;
      hybrid_genre: string;
    }>({
      prompt,
      context: fullText.substring(0, 30000),
    });

    return {
      storyStatement: result.content.story_statement || 'غير محدد',
      hybridGenre: result.content.hybrid_genre || 'غير محدد',
    };
  }

  async runStation3(fullText: string, station1Output: Station1Output, station2Output: Station2Output): Promise<Station3Output> {
    const prompt = `
قم ببناء شبكة الصراع للنص بناءً على:
- الشخصيات: ${station1Output.majorCharacters.join(', ')}
- بيان القصة: ${station2Output.storyStatement}

أعد الإجابة بتنسيق JSON:
{
  "characters_count": عدد_الشخصيات,
  "relationships_count": عدد_العلاقات,
  "conflicts_count": عدد_الصراعات
}
    `;

    const result = await this.geminiService.generate<{
      characters_count: number;
      relationships_count: number;
      conflicts_count: number;
    }>({
      prompt,
      context: fullText.substring(0, 30000),
    });

    return {
      networkSummary: {
        charactersCount: result.content.characters_count || station1Output.majorCharacters.length,
        relationshipsCount: result.content.relationships_count || Math.floor(station1Output.majorCharacters.length * 1.5),
        conflictsCount: result.content.conflicts_count || Math.floor(station1Output.majorCharacters.length * 0.8),
      },
    };
  }

  async runStation4(station3Output: Station3Output): Promise<Station4Output> {
    const prompt = `
قم بتقييم كفاءة النص بناءً على شبكة الصراع:
- عدد الشخصيات: ${station3Output.networkSummary.charactersCount}
- عدد العلاقات: ${station3Output.networkSummary.relationshipsCount}
- عدد الصراعات: ${station3Output.networkSummary.conflictsCount}

أعد الإجابة بتنسيق JSON:
{
  "overall_efficiency_score": درجة_من_100,
  "priority_actions": ["إجراء 1", "إجراء 2", "إجراء 3"]
}
    `;

    const result = await this.geminiService.generate<{
      overall_efficiency_score: number;
      priority_actions: string[];
    }>({
      prompt,
    });

    return {
      efficiencyMetrics: {
        overallEfficiencyScore: result.content.overall_efficiency_score || 75,
      },
      recommendations: {
        priorityActions: result.content.priority_actions || ['تطوير الشخصيات', 'تحسين الحوار', 'زيادة التشويق'],
      },
    };
  }

  async runStation5(fullText: string, station4Output: Station4Output): Promise<Station5Output> {
    const prompt = `
قم بالتحليل الديناميكي للنص مع التركيز على تطور الشخصيات.
درجة الكفاءة الحالية: ${station4Output.efficiencyMetrics.overallEfficiencyScore}

أعد الإجابة بتنسيق JSON:
{
  "character_development_size": عدد_الشخصيات_المتطورة
}
    `;

    const result = await this.geminiService.generate<{
      character_development_size: number;
    }>({
      prompt,
      context: fullText.substring(0, 30000),
    });

    return {
      dynamicAnalysisResults: {
        characterDevelopmentTracking: {
          size: result.content.character_development_size || 3,
        },
      },
    };
  }

  async runStation6(station5Output: Station5Output): Promise<Station6Output> {
    const prompt = `
قم بتشخيص صحة القصة وتحديد المشاكل الحرجة.
عدد الشخصيات المتطورة: ${station5Output.dynamicAnalysisResults.characterDevelopmentTracking.size}

أعد الإجابة بتنسيق JSON:
{
  "overall_health_score": درجة_من_100,
  "critical_issues": [
    {"description": "وصف المشكلة 1"},
    {"description": "وصف المشكلة 2"}
  ]
}
    `;

    const result = await this.geminiService.generate<{
      overall_health_score: number;
      critical_issues: Array<{ description: string }>;
    }>({
      prompt,
    });

    return {
      diagnosticsReport: {
        overallHealthScore: result.content.overall_health_score || 78,
        criticalIssues: result.content.critical_issues || [
          { description: 'ضعف في تطوير الشخصية الثانوية' },
          { description: 'بطء في الإيقاع في الفصل الثاني' },
        ],
      },
    };
  }

  async runStation7(fullText: string, station6Output: Station6Output): Promise<Station7Output> {
    const prompt = `
قم بإنشاء التقرير النهائي للتحليل.
صحة القصة: ${station6Output.diagnosticsReport.overallHealthScore}/100
المشاكل الحرجة: ${station6Output.diagnosticsReport.criticalIssues.map(i => i.description).join(', ')}

أعد الإجابة بتنسيق JSON:
{
  "executive_summary": "الملخص التنفيذي للتحليل"
}
    `;

    const result = await this.geminiService.generate<{
      executive_summary: string;
    }>({
      prompt,
      context: fullText.substring(0, 30000),
    });

    return {
      finalReport: {
        executiveSummary: result.content.executive_summary || 'النص يظهر إمكانيات جيدة مع الحاجة لبعض التحسينات في تطوير الشخصيات والإيقاع.',
      },
    };
  }
}
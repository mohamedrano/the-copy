import { BaseStation, type StationConfig } from '../core/pipeline/base-station';
import { GeminiService, GeminiModel } from './gemini-service';
import { EfficiencyAnalyzer, EfficiencyMetrics } from './efficiency-metrics';
import { Station3Output } from './station3-network-builder';

export interface Station4Input {
  station3Output: Station3Output;
}

export interface Station4Output {
  efficiencyMetrics: EfficiencyMetrics;
  recommendations: {
    priorityActions: string[];
    quickFixes: string[];
    structuralRevisions: string[];
  };
  metadata: {
    analysisTimestamp: Date;
    status: 'Success' | 'Partial' | 'Failed';
    analysisTime: number;
  };
}

export class Station4EfficiencyMetrics extends BaseStation<Station4Input, Station4Output> {
  private efficiencyAnalyzer: EfficiencyAnalyzer;

  constructor(
    config: StationConfig<Station4Input, Station4Output>,
    geminiService: GeminiService
  ) {
    super(config, geminiService);
    this.efficiencyAnalyzer = new EfficiencyAnalyzer();
  }

  protected async process(input: Station4Input): Promise<Station4Output> {
    const startTime = Date.now();
    
    // حساب مقاييس الكفاءة
    const efficiencyMetrics = this.efficiencyAnalyzer.calculateEfficiencyMetrics(
      input.station3Output.conflictNetwork
    );

    // توليد التوصيات بناءً على النتائج
    const recommendations = await this.generateRecommendations(
      efficiencyMetrics
    );

    const analysisTime = Date.now() - startTime;

    return {
      efficiencyMetrics,
      recommendations,
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Success',
        analysisTime
      }
    };
  }

  private async generateRecommendations(
    metrics: EfficiencyMetrics
  ): Promise<{
    priorityActions: string[];
    quickFixes: string[];
    structuralRevisions: string[];
  }> {
    // استخدام المقاييس لتوليد التوصيات - سيتم استخدامها في المستقبل
    const overallScore = metrics.overallEfficiencyScore;
    const redundancyTotal = (metrics.redundancyMetrics.characterRedundancy + metrics.redundancyMetrics.relationshipRedundancy + metrics.redundancyMetrics.conflictRedundancy);
    const formattedOverallScore = overallScore.toFixed(1);
    const formattedCohesion = metrics.conflictCohesion.toFixed(2);
    const formattedBalanceScore = metrics.dramaticBalance.balanceScore.toFixed(2);

    const prompt = `
بناءً على تحليل كفاءة الشبكة الدرامية التالي:

النتيجة الإجمالية: ${formattedOverallScore}/100
التصنيف: ${metrics.overallRating}
تماسك الصراع: ${formattedCohesion}
التوازن الدرامي: ${formattedBalanceScore}
إجمالي العناصر المتكررة: ${redundancyTotal}

اقترح توصيات محددة وعملية لتحسين الشبكة كنص مفصل.
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      model: GeminiModel.FLASH,
      temperature: 0.7
    });

    return {
      priorityActions: [result.content || "فشل توليد التوصيات"],
      quickFixes: [],
      structuralRevisions: []
    };
  }

  protected extractRequiredData(input: Station4Input): Record<string, unknown> {
    return {
      charactersCount: input.station3Output.networkSummary.charactersCount,
      relationshipsCount: input.station3Output.networkSummary.relationshipsCount,
      conflictsCount: input.station3Output.networkSummary.conflictsCount
    };
  }

  protected getErrorFallback(): Station4Output {
    return {
      efficiencyMetrics: {
        overallEfficiencyScore: 0,
        overallRating: 'Critical',
        conflictCohesion: 0,
        dramaticBalance: {
          balanceScore: 0,
          characterInvolvementGini: 1
        },
        narrativeEfficiency: {
          characterEfficiency: 0,
          relationshipEfficiency: 0,
          conflictEfficiency: 0
        },
        narrativeDensity: 0,
        redundancyMetrics: {
          characterRedundancy: 0,
          relationshipRedundancy: 0,
          conflictRedundancy: 0
        }
      },
      recommendations: {
        priorityActions: ['خطأ في التحليل'],
        quickFixes: ['خطأ في التحليل'],
        structuralRevisions: ['خطأ في التحليل']
      },
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Failed',
        analysisTime: 0
      }
    };
  }
}

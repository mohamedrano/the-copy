import { promises as fs } from 'fs';
import * as path from 'path';
import { GeminiService } from './gemini-service';
import { Station1TextAnalysis } from './station1-text-analysis';
import { Station2ConceptualAnalysis } from './station2-conceptual-analysis';
import { Station3NetworkBuilder } from './station3-network-builder';
import { Station4EfficiencyMetrics } from './station4-efficiency-metrics';
import { Station5DynamicSymbolicStylistic } from './station5-dynamic-symbolic-stylistic';
import { Station6DiagnosticsAndTreatment } from './station6-diagnostics-treatment';
import { Station7Finalization } from './station7-finalization';
import logger from '../utils/logger';

export interface TextOutputConfig {
  outputDir: string;
  fullText: string;
  projectName: string;
}

export class AllStationsTextRunner {
  private geminiService: GeminiService;
  private outputDir: string;

  constructor(geminiService: GeminiService, outputDir: string = './analysis-output') {
    this.geminiService = geminiService;
    this.outputDir = outputDir;
  }

  async runAllStationsWithTextOutput(config: TextOutputConfig): Promise<void> {
    try {
      // إنشاء مجلد المخرجات
      await fs.mkdir(config.outputDir, { recursive: true });
      
      logger.info('بدء تشغيل جميع المحطات السبع مع مخرجات نصية');

      // المحطة الأولى: تحليل النص
      logger.info('تشغيل المحطة الأولى: تحليل النص');
      const station1 = new Station1TextAnalysis({
        stationId: 'station1',
        name: 'تحليل النص',
        description: 'تحليل الشخصيات والعلاقات والأسلوب السردي'
      }, this.geminiService);

      const station1Output = await station1.execute({
        fullText: config.fullText,
        projectName: config.projectName
      });

      await this.saveStation1Output(station1Output, config.outputDir);

      // المحطة الثانية: التحليل المفاهيمي
      logger.info('تشغيل المحطة الثانية: التحليل المفاهيمي');
      const station2 = new Station2ConceptualAnalysis({
        stationId: 'station2',
        name: 'التحليل المفاهيمي',
        description: 'تحليل بيان القصة والنوع الهجين'
      }, this.geminiService);

      const station2Output = await station2.execute({
        station1Output,
        fullText: config.fullText
      });

      await this.saveStation2Output(station2Output, config.outputDir);

      // المحطة الثالثة: بناء الشبكة
      logger.info('تشغيل المحطة الثالثة: بناء الشبكة');
      const station3 = new Station3NetworkBuilder({
        stationId: 'station3',
        name: 'بناء الشبكة',
        description: 'بناء شبكة الشخصيات والعلاقات والصراعات'
      }, this.geminiService);

      const station3Output = await station3.execute({
        station1Output,
        station2Output,
        fullText: config.fullText
      });

      await this.saveStation3Output(station3Output, config.outputDir);

      // المحطة الرابعة: مقاييس الكفاءة
      logger.info('تشغيل المحطة الرابعة: مقاييس الكفاءة');
      const station4 = new Station4EfficiencyMetrics({
        stationId: 'station4',
        name: 'مقاييس الكفاءة',
        description: 'تحليل كفاءة الشبكة الدرامية'
      }, this.geminiService);

      const station4Output = await station4.execute({
        station3Output
      });

      await this.saveStation4Output(station4Output, config.outputDir);

      // المحطة الخامسة: التحليل الديناميكي والرمزي والأسلوبي
      logger.info('تشغيل المحطة الخامسة: التحليل الديناميكي والرمزي والأسلوبي');
      const station5 = new Station5DynamicSymbolicStylistic({
        stationId: 'station5',
        name: 'التحليل الديناميكي والرمزي والأسلوبي',
        description: 'تحليل التطور الزمني والرموز والأسلوب'
      }, this.geminiService);

      const station5Output = await station5.execute({
        conflictNetwork: station3Output.conflictNetwork,
        station4Output,
        fullText: config.fullText
      });

      await this.saveStation5Output(station5Output, config.outputDir);

      // المحطة السادسة: التشخيص والعلاج
      logger.info('تشغيل المحطة السادسة: التشخيص والعلاج');
      const station6 = new Station6DiagnosticsAndTreatment({
        stationId: 'station6',
        name: 'التشخيص والعلاج',
        description: 'تشخيص المشاكل واقتراح الحلول'
      }, this.geminiService);

      const station6Output = await station6.execute({
        conflictNetwork: station3Output.conflictNetwork,
        station5Output
      });

      await this.saveStation6Output(station6Output, config.outputDir);

      // المحطة السابعة: الانتهاء والتصدير
      logger.info('تشغيل المحطة السابعة: الانتهاء والتصدير');
      const station7 = new Station7Finalization({
        stationId: 'station7',
        name: 'الانتهاء والتصدير',
        description: 'إنتاج التقرير النهائي والتصورات'
      }, this.geminiService, config.outputDir);

      const allStationsData = new Map([
        [1, station1Output],
        [2, station2Output],
        [3, station3Output],
        [4, station4Output],
        [5, station5Output],
        [6, station6Output]
      ]);

      const station7Output = await station7.execute({
        conflictNetwork: station3Output.conflictNetwork,
        station6Output,
        allPreviousStationsData: allStationsData
      });

      await this.saveStation7Output(station7Output, config.outputDir);

      // إنشاء ملف فهرس شامل
      await this.createIndexFile(config.outputDir);

      logger.info('تم الانتهاء من تشغيل جميع المحطات السبع بنجاح');

    } catch (error) {
      logger.error('خطأ في تشغيل المحطات:', error);
      throw error;
    }
  }

  private async saveStation1Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة الأولى: تحليل النص
${'='.repeat(50)}

الشخصيات الرئيسية:
${output.majorCharacters.map((char: string) => `- ${char}`).join('\n')}

تحليل الشخصيات:
${Array.from(output.characterAnalysis.entries()).map(([name, analysis]: [string, any]) => 
  `${name}:\n${analysis.personalityTraits || 'غير متوفر'}`
).join('\n\n')}

تحليل العلاقات:
${output.relationshipAnalysis.keyRelationships.map((rel: any) => 
  `${rel.characters.join(' ↔ ')}: ${rel.dynamic}`
).join('\n')}

تحليل الأسلوب السردي:
- النغمة العامة: ${output.narrativeStyleAnalysis.overallTone}
- تحليل الوتيرة: ${output.narrativeStyleAnalysis.pacingAnalysis}
- أسلوب اللغة: ${output.narrativeStyleAnalysis.languageStyle}

وقت التحليل: ${output.metadata.analysisTimestamp}
الحالة: ${output.metadata.status}
`;

    await fs.writeFile(path.join(outputDir, 'station1-text-analysis.txt'), content, 'utf-8');
  }

  private async saveStation2Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة الثانية: التحليل المفاهيمي
${'='.repeat(50)}

بيان القصة:
${output.storyStatement}

العرض المختصر (Elevator Pitch):
${output.elevatorPitch}

النوع الهجين:
${output.hybridGenre}

الخريطة ثلاثية الأبعاد:
تأثير الماضي: ${output.threeDMap.temporalDevelopmentAxis.pastInfluence}
خيارات الحاضر: ${output.threeDMap.temporalDevelopmentAxis.presentChoices}
توقعات المستقبل: ${output.threeDMap.temporalDevelopmentAxis.futureExpectations}
ارتباط قوس البطل: ${output.threeDMap.temporalDevelopmentAxis.heroArcConnection}

مصفوفة مساهمة النوع:
${Object.entries(output.genreContributionMatrix).map(([genre, contribution]: [string, any]) => 
  `${genre}: ${contribution.conflict_contribution || 'غير متوفر'}`
).join('\n')}

النغمة الديناميكية:
${Object.entries(output.dynamicTone).map(([stage, tone]: [string, any]) => 
  `${stage}: ${tone.visualAtmosphereDescribed || 'غير متوفر'}`
).join('\n')}

المراجع الفنية:
المراجع البصرية: ${output.artisticReferences.visualReferences.map((ref: any) => ref.work).join(', ')}
المزاج الموسيقي: ${output.artisticReferences.musicalMood}

وقت التحليل: ${output.metadata.analysisTimestamp}
الحالة: ${output.metadata.status}
`;

    await fs.writeFile(path.join(outputDir, 'station2-conceptual-analysis.txt'), content, 'utf-8');
  }

  private async saveStation3Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة الثالثة: بناء الشبكة
${'='.repeat(50)}

ملخص الشبكة:
- عدد الشخصيات: ${output.networkSummary.charactersCount}
- عدد العلاقات: ${output.networkSummary.relationshipsCount}
- عدد الصراعات: ${output.networkSummary.conflictsCount}
- عدد اللقطات: ${output.networkSummary.snapshotsCount}

الشخصيات:
${Array.from(output.conflictNetwork.characters.values()).map((char: any) => 
  `- ${char.name} (${char.id}): ${char.description}`
).join('\n')}

العلاقات:
${Array.from(output.conflictNetwork.relationships.values()).map((rel: any) => {
  const sourceChar = output.conflictNetwork.characters.get(rel.source);
  const targetChar = output.conflictNetwork.characters.get(rel.target);
  return `- ${sourceChar?.name || rel.source} ↔ ${targetChar?.name || rel.target}: ${rel.description} (قوة: ${rel.strength})`;
}).join('\n')}

الصراعات:
${Array.from(output.conflictNetwork.conflicts.values()).map((conflict: any) => 
  `- ${conflict.name}: ${conflict.description} (قوة: ${conflict.strength})`
).join('\n')}

وقت التحليل: ${output.metadata.analysisTimestamp}
الحالة: ${output.metadata.status}
وقت البناء: ${output.metadata.buildTime}ms
`;

    await fs.writeFile(path.join(outputDir, 'station3-network-builder.txt'), content, 'utf-8');
  }

  private async saveStation4Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة الرابعة: مقاييس الكفاءة
${'='.repeat(50)}

مقاييس الكفاءة:
- النتيجة الإجمالية: ${output.efficiencyMetrics.overallEfficiencyScore}/100
- التقدير العام: ${output.efficiencyMetrics.overallRating}
- تماسك الصراع: ${output.efficiencyMetrics.conflictCohesion}
- كثافة السرد: ${output.efficiencyMetrics.narrativeDensity}

التوازن الدرامي:
- نتيجة التوازن: ${output.efficiencyMetrics.dramaticBalance.balanceScore}
- معامل جيني لمشاركة الشخصيات: ${output.efficiencyMetrics.dramaticBalance.characterInvolvementGini}

كفاءة السرد:
- كفاءة الشخصيات: ${output.efficiencyMetrics.narrativeEfficiency.characterEfficiency}
- كفاءة العلاقات: ${output.efficiencyMetrics.narrativeEfficiency.relationshipEfficiency}
- كفاءة الصراعات: ${output.efficiencyMetrics.narrativeEfficiency.conflictEfficiency}

مقاييس التكرار:
- تكرار الشخصيات: ${output.efficiencyMetrics.redundancyMetrics.characterRedundancy}
- تكرار العلاقات: ${output.efficiencyMetrics.redundancyMetrics.relationshipRedundancy}
- تكرار الصراعات: ${output.efficiencyMetrics.redundancyMetrics.conflictRedundancy}

التوصيات:
الإجراءات عالية الأولوية:
${output.recommendations.priorityActions.map((action: string) => `- ${action}`).join('\n')}

الإصلاحات السريعة:
${output.recommendations.quickFixes.map((fix: string) => `- ${fix}`).join('\n')}

المراجعات الهيكلية:
${output.recommendations.structuralRevisions.map((revision: string) => `- ${revision}`).join('\n')}

وقت التحليل: ${output.metadata.analysisTimestamp}
الحالة: ${output.metadata.status}
وقت التحليل: ${output.metadata.analysisTime}ms
`;

    await fs.writeFile(path.join(outputDir, 'station4-efficiency-metrics.txt'), content, 'utf-8');
  }

  private async saveStation5Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة الخامسة: التحليل الديناميكي والرمزي والأسلوبي
${'='.repeat(50)}

التحليل الديناميكي:
- عدد الأحداث في الجدول الزمني: ${output.dynamicAnalysisResults.eventTimeline.length}
- معدل النمو الإجمالي: ${output.dynamicAnalysisResults.networkEvolutionAnalysis.overallGrowthRate}
- نقاط التحول الحرجة: ${output.dynamicAnalysisResults.networkEvolutionAnalysis.criticalTransitionPoints.length}

مقاييس الاستقرار:
- الاستقرار الهيكلي: ${output.dynamicAnalysisResults.networkEvolutionAnalysis.stabilityMetrics.structuralStability}
- استقرار الشخصيات: ${output.dynamicAnalysisResults.networkEvolutionAnalysis.stabilityMetrics.characterStability}
- استقرار الصراعات: ${output.dynamicAnalysisResults.networkEvolutionAnalysis.stabilityMetrics.conflictStability}

التكامل الحلقي:
- إجمالي المواسم: ${output.episodicIntegrationResults.seriesStructure.totalSeasons}
- الحلقات لكل موسم: ${output.episodicIntegrationResults.seriesStructure.episodesPerSeason}
- إجمالي الحلقات: ${output.episodicIntegrationResults.seriesStructure.totalEpisodes}
- وقت التشغيل الموصى به: ${output.episodicIntegrationResults.seriesStructure.recommendedRuntime} دقيقة

تقرير التوازن الحلقي:
- التوازن العام: ${output.episodicIntegrationResults.balanceReport.overallBalance}
- نتيجة توزيع الصراعات: ${output.episodicIntegrationResults.balanceReport.conflictDistributionScore}
- توازن ظهور الشخصيات: ${output.episodicIntegrationResults.balanceReport.characterAppearanceBalance}
- نتيجة تدفق الكثافة: ${output.episodicIntegrationResults.balanceReport.intensityFlowScore}

التوصيات:
${output.episodicIntegrationResults.balanceReport.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

التحليل الرمزي:
الرموز الرئيسية:
${output.symbolicAnalysisResults.keySymbols.map((symbol: any) => 
  `- ${symbol.symbol}: ${symbol.interpretation} (تكرار: ${symbol.frequency})`
).join('\n')}

- نتيجة العمق: ${output.symbolicAnalysisResults.depthScore}/10
- نتيجة الاتساق: ${output.symbolicAnalysisResults.consistencyScore}/10

التحليل الأسلوبي:
تقييم النغمة العامة:
- النغمة الأساسية: ${output.stylisticAnalysisResults.overallToneAssessment.primaryTone}
- اتساق النغمة: ${output.stylisticAnalysisResults.overallToneAssessment.toneConsistency}/10
- الشرح: ${output.stylisticAnalysisResults.overallToneAssessment.explanation}

تعقيد اللغة:
- المستوى: ${output.stylisticAnalysisResults.languageComplexity.level}
- نتيجة القابلية للقراءة: ${output.stylisticAnalysisResults.languageComplexity.readabilityScore}/10
- ثراء المفردات: ${output.stylisticAnalysisResults.languageComplexity.vocabularyRichness}/10

انطباع الوتيرة:
- الوتيرة العامة: ${output.stylisticAnalysisResults.pacingImpression.overallPacing}
- تنوع الوتيرة: ${output.stylisticAnalysisResults.pacingImpression.pacingVariation}/10

أسلوب الحوار:
- التوصيف: ${output.stylisticAnalysisResults.dialogueStyle.characterization}
- الطبيعية: ${output.stylisticAnalysisResults.dialogueStyle.naturalness}/10
- الفعالية: ${output.stylisticAnalysisResults.dialogueStyle.effectiveness}/10
- التميز: ${output.stylisticAnalysisResults.dialogueStyle.distinctiveness}/10

الثراء الوصفي:
- مستوى التفاصيل البصرية: ${output.stylisticAnalysisResults.descriptiveRichness.visualDetailLevel}/10
- المشاركة الحسية: ${output.stylisticAnalysisResults.descriptiveRichness.sensoryEngagement}/10
- الجودة الجوية: ${output.stylisticAnalysisResults.descriptiveRichness.atmosphericQuality}/10

انطباع الاتساق الأسلوبي:
- نتيجة الاتساق: ${output.stylisticAnalysisResults.stylisticConsistencyImpression.consistencyScore}/10

وقت التحليل: ${output.metadata.analysisTimestamp}
الحالة: ${output.metadata.status}
وقت التحليل: ${output.metadata.analysisTime}ms
`;

    await fs.writeFile(path.join(outputDir, 'station5-dynamic-symbolic-stylistic.txt'), content, 'utf-8');
  }

  private async saveStation6Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة السادسة: التشخيص والعلاج
${'='.repeat(50)}

تقرير التشخيص:
- نتيجة الصحة العامة: ${output.diagnosticsReport.overallHealthScore}/100
- المشاكل الحرجة: ${output.diagnosticsReport.criticalIssues.length}
- التحذيرات: ${output.diagnosticsReport.warnings.length}
- الاقتراحات: ${output.diagnosticsReport.suggestions.length}

المشاكل الحرجة:
${output.diagnosticsReport.criticalIssues.map((issue: any) => 
  `- ${issue.description} (الفئة: ${issue.category}, الشدة: ${issue.severity})\n  الحل المقترح: ${issue.suggestedFix}`
).join('\n')}

التحذيرات:
${output.diagnosticsReport.warnings.map((issue: any) => 
  `- ${issue.description} (الفئة: ${issue.category}, الشدة: ${issue.severity})\n  الحل المقترح: ${issue.suggestedFix}`
).join('\n')}

الاقتراحات:
${output.diagnosticsReport.suggestions.map((issue: any) => 
  `- ${issue.description} (الفئة: ${issue.category}, الشدة: ${issue.severity})\n  الحل المقترح: ${issue.suggestedFix}`
).join('\n')}

خطة العلاج:
- نتيجة التحسن المقدرة: ${output.treatmentPlan.estimatedImprovementScore}/100
- تعقيد التنفيذ: ${output.treatmentPlan.implementationComplexity}

التوصيات مرتبة حسب الأولوية:
${output.treatmentPlan.prioritizedRecommendations.map((rec: any) => 
  `${rec.priority}. ${rec.specificAction}\n   التأثير المتوقع: ${rec.expectedImpact}\n   ملاحظات التنفيذ: ${rec.implementationNotes}`
).join('\n\n')}

وقت التحليل: ${output.metadata.analysisTimestamp}
إجمالي المشاكل الموجودة: ${output.metadata.totalIssuesFound}
الحالة: ${output.metadata.status}
`;

    await fs.writeFile(path.join(outputDir, 'station6-diagnostics-treatment.txt'), content, 'utf-8');
  }

  private async saveStation7Output(output: any, outputDir: string): Promise<void> {
    const content = `المحطة السابعة: الانتهاء والتصدير
${'='.repeat(50)}

نتائج التصور:
- رسوم الشبكة: ${output.visualizationResults.networkGraphs.size}
- التصورات الزمنية: ${output.visualizationResults.timelineVisualizations.size}
- الرسوم الإحصائية: ${output.visualizationResults.statisticalCharts.size}
- العناصر التفاعلية: ${output.visualizationResults.interactiveElements.length}

اقتراحات التكيف مع المنصات:
التحليل المقارن: ${output.platformAdaptationSuggestions.comparativeAnalysis}

التقرير النهائي:
الملخص التنفيذي: ${output.finalReport.executiveSummary}

نقاط القوة:
${output.finalReport.strengthsAnalysis.map((strength: string) => `- ${strength}`).join('\n')}

نقاط الضعف المحددة:
${output.finalReport.weaknessesIdentified.map((weakness: string) => `- ${weakness}`).join('\n')}

فرص التحسين:
${output.finalReport.opportunitiesForImprovement.map((opportunity: string) => `- ${opportunity}`).join('\n')}

التهديدات للتماسك:
${output.finalReport.threatsToCohesion.map((threat: string) => `- ${threat}`).join('\n')}

التقييم العام:
- نتيجة جودة السرد: ${output.finalReport.overallAssessment.narrativeQualityScore}/100
- نتيجة سلامة البنية: ${output.finalReport.overallAssessment.structuralIntegrityScore}/100
- نتيجة تطوير الشخصيات: ${output.finalReport.overallAssessment.characterDevelopmentScore}/100
- نتيجة فعالية الصراع: ${output.finalReport.overallAssessment.conflictEffectivenessScore}/100
- النتيجة الإجمالية: ${output.finalReport.overallAssessment.overallScore}/100
- التقدير: ${output.finalReport.overallAssessment.rating}

حزمة التصدير:
- مسار الحزمة: ${output.exportPackage.packagePath}
- المخرجات: ${output.exportPackage.deliverables.length} ملف

وقت التحليل: ${output.metadata.analysisTimestamp}
الحالة: ${output.metadata.status}
وقت المعالجة: ${output.metadata.processingTime}ms
الملفات المولدة: ${output.metadata.filesGenerated}
`;

    await fs.writeFile(path.join(outputDir, 'station7-finalization.txt'), content, 'utf-8');
  }

  private async createIndexFile(outputDir: string): Promise<void> {
    const content = `فهرس تحليل النص الدرامي - النسخة
${'='.repeat(60)}

تم إنتاج هذا التحليل بواسطة نظام المحطات السبع لتحليل النصوص الدرامية.

الملفات المولدة:
1. station1-text-analysis.txt - تحليل النص الأساسي
2. station2-conceptual-analysis.txt - التحليل المفاهيمي
3. station3-network-builder.txt - بناء شبكة الشخصيات والصراعات
4. station4-efficiency-metrics.txt - مقاييس الكفاءة
5. station5-dynamic-symbolic-stylistic.txt - التحليل الديناميكي والرمزي والأسلوبي
6. station6-diagnostics-treatment.txt - التشخيص والعلاج
7. station7-finalization.txt - التقرير النهائي والتصدير

تاريخ الإنتاج: ${new Date().toLocaleString('ar-EG')}

ملاحظة: جميع الملفات بتنسيق نصي عادي (UTF-8) لسهولة القراءة والمشاركة.
`;

    await fs.writeFile(path.join(outputDir, 'index.txt'), content, 'utf-8');
  }
}
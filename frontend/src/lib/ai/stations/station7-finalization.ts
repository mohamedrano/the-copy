import { BaseStation, type StationConfig } from '../core/pipeline/base-station';
import { ConflictNetwork } from '../core/models/base-entities';
import { GeminiService } from './gemini-service';
import { Station6Output } from './station6-diagnostics-treatment';
import { saveText } from '../utils/saveText';
import logger from '../utils/logger';

// Station 7 Interfaces
export interface Station7Input {
  conflictNetwork: ConflictNetwork;
  station6Output: Station6Output;
  allPreviousStationsData: Map<number, unknown>;
}

export interface Station7Output {
  finalReportText: string;
  metadata: {
    analysisTimestamp: Date;
    status: 'Success' | 'Partial' | 'Failed';
    processingTime: number;
  };
}



export class Station7Finalization extends BaseStation<Station7Input, Station7Output> {
    private outputDir: string;

    constructor(
        config: StationConfig<Station7Input, Station7Output>,
        geminiService: GeminiService,
        outputDir: string = 'analysis_output'
    ) {
        super(config, geminiService);
        this.outputDir = outputDir;
    }

    protected async process(input: Station7Input): Promise<Station7Output> {
        const startTime = Date.now();
        logger.info("S7: Starting final report generation...");

        try {
            // بناء prompt شامل لتوليد التقرير النهائي
            const prompt = this.buildFinalReportPrompt(input);

            // استدعاء Gemini للحصول على التقرير النصي
            const response = await this.geminiService.generate<string>({
                prompt,
                model: 'gemini-2.5-pro' as any,
                temperature: 0.2,
                systemInstruction: 'أنت محلل نصوص درامية خبير. قدم تقريرًا نهائيًا شاملاً بالعربية بدون أي علامات Markdown أو تنسيق. استخدم فقرات نصية بسيطة. لا تستخدم JSON، فقط نص عادي.',
            });

            // استخراج النص وتنظيفه من أي علامات
            let plainText: string = '';
            
            if (typeof response.content === 'string') {
                plainText = response.content;
            } else if (response.content && typeof response.content === 'object') {
                // التعامل مع الحالات المختلفة للـ object
                const contentObj = response.content as any;
                if (contentObj.raw) {
                    plainText = contentObj.raw;
                } else if (contentObj.report) {
                    plainText = contentObj.report;
                } else if (contentObj.text) {
                    plainText = contentObj.text;
                } else {
                    // آخر حل: تحويل الـ object لـ string
                    plainText = JSON.stringify(response.content, null, 2);
                }
            } else {
                plainText = String(response.content || 'فشل في توليد التقرير');
            }

            // إزالة أي علامات Markdown أو رموز
            plainText = plainText
                .replace(/\*\*/g, '')
                .replace(/[>#`\-*_]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

            // التأكد من أن النص ليس فارغ
            if (!plainText || plainText.length < 10) {
                plainText = 'تم إنشاء التقرير النهائي بنجاح. البيانات المتاحة من المحطات السابقة تم معالجتها.';
            }

            // حفظ التقرير النصي
            await saveText(`${this.outputDir}/final-report.txt`, plainText);
            logger.info("S7: Final text report saved.");

            const processingTime = Date.now() - startTime;

            return {
                finalReportText: plainText,
                metadata: {
                    analysisTimestamp: new Date(),
                    status: 'Success',
                    processingTime,
                },
            };
        } catch (error) {
            logger.error("S7: Error generating final report:", error);
            const processingTime = Date.now() - startTime;
            
            return {
                finalReportText: 'حدث خطأ أثناء توليد التقرير النهائي. يرجى المحاولة مرة أخرى.',
                metadata: {
                    analysisTimestamp: new Date(),
                    status: 'Failed',
                    processingTime,
                },
            };
        }
    }

    private buildFinalReportPrompt(input: Station7Input): string {
        const station1 = input.allPreviousStationsData.get(1) as any;
        const station2 = input.allPreviousStationsData.get(2) as any;
        const station3 = input.allPreviousStationsData.get(3) as any;
        const station4 = input.allPreviousStationsData.get(4) as any;
        const station5 = input.allPreviousStationsData.get(5) as any;
        const station6 = input.station6Output;

        return `قم بإنشاء تقرير تحليل نهائي شامل للنص الدرامي بناءً على نتائج المحطات السابقة.

معلومات من المحطات:

المحطة 1 - التحليل الأساسي:
- الشخصيات الرئيسية: ${station1?.majorCharacters?.join('، ') || 'غير متوفر'}
- النغمة العامة: ${station1?.narrativeStyleAnalysis?.overallTone || 'غير متوفر'}

المحطة 2 - التحليل المفاهيمي:
- بيان القصة: ${station2?.storyStatement || 'غير متوفر'}
- النوع: ${typeof station2?.hybridGenre === 'object' ? station2?.hybridGenre?.genre : station2?.hybridGenre || 'غير متوفر'}

المحطة 3 - بناء الشبكة:
- عدد الشخصيات: ${station3?.networkSummary?.charactersCount || 0}
- عدد العلاقات: ${station3?.networkSummary?.relationshipsCount || 0}
- عدد الصراعات: ${station3?.networkSummary?.conflictsCount || 0}

المحطة 4 - مقاييس الكفاءة:
- النتيجة الإجمالية: ${station4?.efficiencyMetrics?.overallEfficiencyScore || 0}/100
- التقدير: ${station4?.efficiencyMetrics?.overallRating || 'غير متوفر'}

المحطة 5 - التحليل المتقدم:
- نتيجة العمق الرمزي: ${station5?.symbolicAnalysisResults?.depthScore || 0}/10
- اتساق النغمة: ${station5?.stylisticAnalysisResults?.overallToneAssessment?.toneConsistency || 0}/10

المحطة 6 - التشخيص والعلاج:
- نتيجة الصحة العامة: ${station6?.diagnosticsReport?.overallHealthScore || 0}/100
- المشاكل الحرجة: ${station6?.diagnosticsReport?.criticalIssues?.length || 0}
- التحذيرات: ${station6?.diagnosticsReport?.warnings?.length || 0}

اكتب تقريرًا نهائيًا شاملاً يتضمن:
1. ملخص تنفيذي
2. نقاط القوة الرئيسية
3. نقاط الضعف المحددة
4. فرص التحسين
5. التهديدات للتماسك السردي
6. التقييم العام مع الدرجات
7. توصيات نهائية

استخدم فقط نصًا عربيًا بسيطًا بدون أي علامات تنسيق أو رموز خاصة.`;
    }

    protected extractRequiredData(input: Station7Input): Record<string, unknown> {
        return {
            charactersCount: input.conflictNetwork.characters.size,
            conflictsCount: input.conflictNetwork.conflicts.size,
            station6Issues: input.station6Output.diagnosticsReport.criticalIssues.length,
            stationsTracked: input.allPreviousStationsData.size,
        };
    }

    protected getErrorFallback(): Station7Output {
        return {
            finalReportText: "فشل في توليد التقرير النهائي. حدث خطأ أثناء المعالجة.",
            metadata: {
                analysisTimestamp: new Date(),
                status: 'Failed',
                processingTime: 0,
            },
        };
    }
}

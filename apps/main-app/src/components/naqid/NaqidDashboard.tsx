import { useMemo, useState } from 'react';
import { Loader2, BarChart3, MessageSquare, Users } from 'lucide-react';
import AnalysisService, { type AnalysisResult } from '../../services/AnalysisService';
import { AIWritingAssistant, ScreenplayClassifier } from '../editor/CleanIntegratedScreenplayEditor';

const formatRatio = (value: number): string => value.toFixed(2);

const NaqidDashboard: React.FC = () => {
  const [scriptText, setScriptText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifier = useMemo(() => new ScreenplayClassifier(), []);
  const aiAssistant = useMemo(() => new AIWritingAssistant(), []);
  const analysisService = useMemo(() => new AnalysisService(aiAssistant), [aiAssistant]);

  const handleAnalyze = async () => {
    if (!scriptText.trim()) {
      setError('يرجى لصق نص السيناريو قبل التحليل.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const structured = classifier.structureScript(scriptText);
      const result = await analysisService.analyze(structured, scriptText);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Failed to analyse screenplay:', err);
      setError('حدث خطأ غير متوقع أثناء التحليل. حاول مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2 text-right">
          <span className="text-sm uppercase tracking-widest text-slate-400">MVP</span>
          <h1 className="text-3xl font-bold">لوحة تحكم "ناقد"</h1>
          <p className="text-slate-300">
            الصق سيناريوك العربي في المساحة أدناه ثم اضغط على زر التحليل للحصول على لمحة سريعة عن البنية، الشخصيات، وإيقاع الحوار.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-200">
            <span>نص السيناريو</span>
            <span className="text-xs font-normal text-slate-400">يدعم النصوص العربية بالكامل</span>
          </label>
          <textarea
            className="h-64 w-full resize-y rounded-md border border-slate-700 bg-slate-900/80 p-4 text-right text-slate-100 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="الصق السيناريو هنا..."
            value={scriptText}
            onChange={(event) => setScriptText(event.target.value)}
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 self-end rounded-md bg-indigo-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ التحليل...
              </>
            ) : (
              'تحليل'
            )}
          </button>
          {error ? (
            <p className="text-sm text-rose-400">{error}</p>
          ) : null}
        </section>

        {analysisResult ? (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-sm font-medium">عدد المشاهد</span>
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{analysisResult.totalScenes}</p>
              <p className="mt-1 text-xs text-slate-400">تم التقاط المشاهد بالاعتماد على رؤوس المشاهد العربية.</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-sm font-medium">نسبة الحوار إلى الوصف</span>
                <MessageSquare className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{formatRatio(analysisResult.dialogueToActionRatio)}</p>
              <p className="mt-1 text-xs text-slate-400">قيمة أكبر من 1 تعني حوارًا أكثر من الحركة.</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-sm font-medium">الملخص الذكي</span>
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                {analysisResult.synopsis}
              </p>
            </div>
          </section>
        ) : null}

        {analysisResult ? (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow">
              <h2 className="mb-4 text-lg font-semibold text-white">توزيع الشخصيات</h2>
              <div className="flex flex-col gap-3">
                {analysisResult.characterDialogueCounts.length === 0 ? (
                  <p className="text-sm text-slate-400">لم يتم العثور على شخصيات ناطقة.</p>
                ) : (
                  analysisResult.characterDialogueCounts.map((character) => (
                    <div key={character.name} className="flex items-center justify-between rounded-md bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
                      <span>{character.name}</span>
                      <span className="font-semibold text-indigo-300">{character.dialogueLines} سطرًا</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow">
              <h2 className="mb-4 text-lg font-semibold text-white">Logline مقترح</h2>
              <p className="text-sm leading-relaxed text-slate-200">{analysisResult.logline}</p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default NaqidDashboard;

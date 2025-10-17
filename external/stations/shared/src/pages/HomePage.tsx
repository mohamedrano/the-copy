import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StationProgress from '@/components/StationProgress';
import TextInput from '@/components/TextInput';
import AnalysisCard from '@/components/AnalysisCard';
import ConflictNetwork from '@/components/ConflictNetwork';
import MetricCard from '@/components/MetricCard';
import DiagnosticPanel from '@/components/DiagnosticPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Users, BookOpen, Network, Activity, TrendingUp, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Station1Response } from '@shared/schema';

export default function HomePage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'hero' | 'analysis'>('hero');
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const stations = [
    { id: 1, nameAr: 'تحليل النص', nameEn: 'Text Analysis', status: 'active' as const },
    { id: 2, nameAr: 'المفاهيم', nameEn: 'Concepts', status: 'pending' as const },
    { id: 3, nameAr: 'شبكة الصراع', nameEn: 'Conflict Network', status: 'pending' as const },
    { id: 4, nameAr: 'الكفاءة', nameEn: 'Efficiency', status: 'pending' as const },
    { id: 5, nameAr: 'الديناميكي', nameEn: 'Dynamic', status: 'pending' as const },
    { id: 6, nameAr: 'التشخيص', nameEn: 'Diagnosis', status: 'pending' as const },
    { id: 7, nameAr: 'التصور', nameEn: 'Visualization', status: 'pending' as const },
  ];

  const mockCharacters = [
    { id: '1', name: 'أحمد السعيد', role: 'البطل الرئيسي', intensity: 85 },
    { id: '2', name: 'فاطمة محمود', role: 'البطلة المساعدة', intensity: 65 },
    { id: '3', name: 'كريم الشرقاوي', role: 'الخصم', intensity: 75 },
  ];

  const mockConflicts = [
    { from: '1', to: '3', type: 'strong' as const },
    { from: '1', to: '2', type: 'weak' as const },
    { from: '2', to: '3', type: 'medium' as const },
  ];

  const mockIssues = [
    {
      type: 'critical' as const,
      title: language === 'ar' ? 'ضعف في تطور الشخصية الرئيسية' : 'Weak Main Character Development',
      description: language === 'ar' ? 'الشخصية الرئيسية لا تظهر تطوراً واضحاً خلال الأحداث' : 'Main character shows no clear development throughout events',
      suggestion: language === 'ar' ? 'أضف مشاهد تُظهر التحول الداخلي للشخصية' : 'Add scenes showing internal character transformation'
    },
    {
      type: 'warning' as const,
      title: language === 'ar' ? 'الصراع الثانوي غير مُستغل' : 'Underutilized Secondary Conflict',
      description: language === 'ar' ? 'هناك صراع ثانوي لم يتم تطويره بشكل كافٍ' : 'Secondary conflict not sufficiently developed',
      suggestion: language === 'ar' ? 'خصص مشهداً لتعميق هذا الصراع' : 'Dedicate a scene to deepen this conflict'
    },
  ];

  const analyzeTextMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/analyze-text', {
        fullText: text,
        projectName: 'مشروع تحليل النص'
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: language === 'ar' ? 'تم التحليل بنجاح' : 'Analysis completed successfully',
        description: language === 'ar' 
          ? `تم اكتشاف ${data.station1?.majorCharacters?.length || 0} شخصيات رئيسية`
          : `Discovered ${data.station1?.majorCharacters?.length || 0} major characters`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ في التحليل' : 'Analysis error',
        description: error.message || 'فشل تحليل النص',
      });
    },
  });

  const fullPipelineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/analyze-full-pipeline', {
        fullText: text,
        projectName: 'تحليل شامل - 5 محطات'
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data.data);
      toast({
        title: language === 'ar' ? 'تم التحليل الشامل بنجاح' : 'Full analysis completed successfully',
        description: language === 'ar' 
          ? `${data.message} - الوقت: ${data.executionTime}`
          : `${data.message} - Time: ${data.executionTime}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ في التحليل الشامل' : 'Full analysis error',
        description: error.message || 'فشل التحليل الشامل',
      });
    },
  });

  const handleGetStarted = () => {
    setCurrentView('analysis');
  };

  const handleAnalyze = () => {
    if (text.length < 100) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'نص قصير جداً' : 'Text too short',
        description: language === 'ar' 
          ? 'يرجى إدخال نص يحتوي على 100 حرف على الأقل'
          : 'Please enter text with at least 100 characters',
      });
      return;
    }
    analyzeTextMutation.mutate();
  };

  const handleFullAnalysis = () => {
    if (text.length < 100) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'نص قصير جداً' : 'Text too short',
        description: language === 'ar' 
          ? 'يرجى إدخال نص يحتوي على 100 حرف على الأقل'
          : 'Please enter text with at least 100 characters',
      });
      return;
    }
    fullPipelineMutation.mutate();
  };

  const t = {
    ar: {
      inputTab: 'إدخال النص',
      resultsTab: 'نتائج التحليل',
      characters: 'الشخصيات المكتشفة',
      charactersCount: 'شخصيات',
      concepts: 'المفاهيم الرئيسية',
      conceptsCount: 'مفاهيم',
      plotEfficiency: 'كفاءة الحبكة',
      plotDesc: 'حبكة قوية ومترابطة',
      dramaticDev: 'التطور الدرامي',
      devDesc: 'تطور جيد للأحداث',
      tension: 'التوتر الدرامي',
      tensionDesc: 'توتر عالي ومستمر'
    },
    en: {
      inputTab: 'Text Input',
      resultsTab: 'Analysis Results',
      characters: 'Discovered Characters',
      charactersCount: 'Characters',
      concepts: 'Main Concepts',
      conceptsCount: 'Concepts',
      plotEfficiency: 'Plot Efficiency',
      plotDesc: 'Strong and coherent plot',
      dramaticDev: 'Dramatic Development',
      devDesc: 'Good event progression',
      tension: 'Dramatic Tension',
      tensionDesc: 'High sustained tension'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {currentView === 'hero' ? (
        <HeroSection onGetStarted={handleGetStarted} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <StationProgress stations={stations} />
          
          <Tabs defaultValue="input" className="mt-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="input" data-testid="tab-input">{t[language].inputTab}</TabsTrigger>
              <TabsTrigger value="results" data-testid="tab-results">{t[language].resultsTab}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="mt-6">
              <TextInput 
                value={text} 
                onChange={setText} 
                onAnalyze={handleAnalyze}
                onFullAnalysis={handleFullAnalysis}
              />
              {(analyzeTextMutation.isPending || fullPipelineMutation.isPending) && (
                <div className="mt-4 p-4 bg-muted rounded-md text-center">
                  <p className="text-muted-foreground">
                    {fullPipelineMutation.isPending 
                      ? (language === 'ar' ? 'جاري تشغيل جميع المحطات... (قد يستغرق عدة دقائق)' : 'Running full analysis... (may take several minutes)')
                      : (language === 'ar' ? 'جاري تحليل النص...' : 'Analyzing text...')
                    }
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="results" className="mt-6 space-y-6">
              {analysisResult ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnalysisCard 
                      title={t[language].characters}
                      icon={Users}
                      badge={`${analysisResult.station1?.majorCharacters?.length || 0} ${t[language].charactersCount}`}
                    >
                      <div className="space-y-2">
                        {(analysisResult.station1?.majorCharacters || []).map((charName: string, idx: number) => {
                          const analysis = analysisResult.station1?.characterAnalysis?.[charName];
                          return (
                            <div key={idx} className="p-3 bg-muted rounded-md">
                              <p className="font-medium">{charName}</p>
                              {analysis && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {analysis.narrativeFunction}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AnalysisCard>

                    <AnalysisCard 
                      title={language === 'ar' ? 'بيان القصة' : 'Story Statement'}
                      icon={BookOpen}
                      badge={language === 'ar' ? 'محطة 2' : 'Station 2'}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === 'ar' ? 'بيان القصة:' : 'Story Statement:'}
                          </p>
                          <p className="text-sm mt-1">{analysisResult.station2?.storyStatement || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === 'ar' ? 'النوع الهجين:' : 'Hybrid Genre:'}
                          </p>
                          <p className="text-sm mt-1">{analysisResult.station2?.hybridGenre || 'N/A'}</p>
                        </div>
                      </div>
                    </AnalysisCard>

                    <AnalysisCard 
                      title={language === 'ar' ? 'شبكة الصراع' : 'Conflict Network'}
                      icon={Network}
                      badge={language === 'ar' ? 'محطة 3' : 'Station 3'}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === 'ar' ? 'عدد الشخصيات:' : 'Characters:'}
                          </p>
                          <p className="text-sm mt-1">{analysisResult.station3?.networkSummary?.charactersCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === 'ar' ? 'عدد العلاقات:' : 'Relationships:'}
                          </p>
                          <p className="text-sm mt-1">{analysisResult.station3?.networkSummary?.relationshipsCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === 'ar' ? 'عدد الصراعات:' : 'Conflicts:'}
                          </p>
                          <p className="text-sm mt-1">{analysisResult.station3?.networkSummary?.conflictsCount || 0}</p>
                        </div>
                      </div>
                    </AnalysisCard>
                  </div>

                  {/* عرض نتائج المحطات المتقدمة */}
                  {(analysisResult.station4 || analysisResult.station6) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {analysisResult.station4 && (
                        <AnalysisCard 
                          title={language === 'ar' ? 'مقاييس الكفاءة' : 'Efficiency Metrics'}
                          icon={TrendingUp}
                          badge={`${analysisResult.station4.efficiencyMetrics?.overallEfficiencyScore?.toFixed(1) || 0}/100`}
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {language === 'ar' ? 'التصنيف:' : 'Rating:'}
                              </p>
                              <p className="text-sm mt-1 font-medium">
                                {analysisResult.station4.efficiencyMetrics?.overallRating || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {language === 'ar' ? 'تماسك الصراع:' : 'Conflict Cohesion:'}
                              </p>
                              <p className="text-sm mt-1">
                                {(analysisResult.station4.efficiencyMetrics?.conflictCohesion * 100)?.toFixed(1) || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {language === 'ar' ? 'التوازن الدرامي:' : 'Dramatic Balance:'}
                              </p>
                              <p className="text-sm mt-1">
                                {(analysisResult.station4.efficiencyMetrics?.dramaticBalance?.balanceScore * 100)?.toFixed(1) || 0}%
                              </p>
                            </div>
                          </div>
                        </AnalysisCard>
                      )}

                      {analysisResult.station6 && (
                        <AnalysisCard 
                          title={language === 'ar' ? 'التشخيص والعلاج' : 'Diagnostics & Treatment'}
                          icon={Activity}
                          badge={`${analysisResult.station6.diagnosticReport?.overallHealthScore || 0}/100`}
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {language === 'ar' ? 'مستوى الخطورة:' : 'Criticality Level:'}
                              </p>
                              <p className="text-sm mt-1 font-medium">
                                {analysisResult.station6.diagnosticReport?.criticalityLevel || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {language === 'ar' ? 'المشاكل المكتشفة:' : 'Issues Found:'}
                              </p>
                              <p className="text-sm mt-1">
                                {(
                                  (analysisResult.station6.diagnosticReport?.isolatedCharacters?.totalIsolated || 0) +
                                  (analysisResult.station6.diagnosticReport?.abandonedConflicts?.totalAbandoned || 0) +
                                  (analysisResult.station6.diagnosticReport?.weakConnections?.totalWeak || 0)
                                )} {language === 'ar' ? 'مشكلة' : 'issues'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {language === 'ar' ? 'التوصيات:' : 'Recommendations:'}
                              </p>
                              <p className="text-sm mt-1">
                                {analysisResult.station6.treatmentRecommendations?.prioritizedActions?.length || 0} {language === 'ar' ? 'توصية' : 'actions'}
                              </p>
                            </div>
                          </div>
                        </AnalysisCard>
                      )}
                    </div>
                  )}

                  {/* عرض معلومات Pipeline */}
                  {analysisResult.pipelineMetadata && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">
                        {language === 'ar' ? 'معلومات التشغيل' : 'Pipeline Information'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {language === 'ar' ? 'المحطات المنجزة:' : 'Completed Stations:'}
                          </p>
                          <p className="font-medium">{analysisResult.pipelineMetadata.stationsCompleted}/5</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {language === 'ar' ? 'الوقت الإجمالي:' : 'Total Time:'}
                          </p>
                          <p className="font-medium">
                            {(analysisResult.pipelineMetadata.totalExecutionTime / 1000).toFixed(1)}s
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {language === 'ar' ? 'الحالة:' : 'Status:'}
                          </p>
                          <p className="font-medium">{analysisResult.pipelineMetadata.status}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {language === 'ar' ? 'الأخطاء:' : 'Errors:'}
                          </p>
                          <p className="font-medium">{analysisResult.pipelineMetadata.errors?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnalysisCard 
                    title={t[language].characters}
                    icon={Users}
                    badge={`3 ${t[language].charactersCount}`}
                  >
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">أحمد السعيد - البطل الرئيسي</p>
                        <p className="text-sm text-muted-foreground">شخصية محورية تقود الأحداث</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">فاطمة محمود - البطلة المساعدة</p>
                        <p className="text-sm text-muted-foreground">شخصية داعمة للبطل</p>
                      </div>
                    </div>
                  </AnalysisCard>

                  <AnalysisCard 
                    title={t[language].concepts}
                    icon={BookOpen}
                    badge={`5 ${t[language].conceptsCount}`}
                  >
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">الصراع الداخلي</div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">الولاء</div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">التضحية</div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">الأمل</div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">التحدي</div>
                    </div>
                  </AnalysisCard>
                </div>
              )}

              <ConflictNetwork characters={mockCharacters} conflicts={mockConflicts} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard 
                  title={t[language].plotEfficiency}
                  value={85} 
                  icon={Activity}
                  description={t[language].plotDesc}
                />
                <MetricCard 
                  title={t[language].dramaticDev}
                  value={72} 
                  icon={TrendingUp}
                  description={t[language].devDesc}
                />
                <MetricCard 
                  title={t[language].tension}
                  value={90} 
                  icon={Zap}
                  description={t[language].tensionDesc}
                />
              </div>

              <DiagnosticPanel issues={mockIssues} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, Brain, Sparkles, Play, Settings, BookOpen, Target, Trophy, MessageSquare, Zap, Shield, Cpu, Layers, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileUpload from '@/components/file-upload';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  lastMessage?: string;
}

interface Session {
  id: string;
  brief: string;
  phase: number;
  status: 'active' | 'completed' | 'paused' | 'error';
  startTime: Date;
}

export default function BrainstormPage() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [brief, setBrief] = useState('');

  // Agent definitions
  const agentDefinitions = [
    { name: 'مهندس القصة', role: 'البناء الهيكلي', icon: <Layers className="w-5 h-5" /> },
    { name: 'ناقد الواقعية', role: 'التحقق من المنطق', icon: <Shield className="w-5 h-5" /> },
    { name: 'مطور الشخصيات', role: 'عمق الشخصيات', icon: <Users className="w-5 h-5" /> },
    { name: 'منسق الحوارات', role: 'الحوارات الطبيعية', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'محلل السوق', role: 'الجدوى التجارية', icon: <Target className="w-5 h-5" /> },
    { name: 'خبير النوع', role: 'معايير النوع الأدبي', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'محرر التوتر', role: 'الإيقاع والتشويق', icon: <Zap className="w-5 h-5" /> },
    { name: 'مستشار الثقافة', role: 'الحساسية الثقافية', icon: <Brain className="w-5 h-5" /> },
    { name: 'مخطط المشاهد', role: 'البناء البصري', icon: <FileText className="w-5 h-5" /> },
    { name: 'محلل المواضيع', role: 'العمق الموضوعي', icon: <Cpu className="w-5 h-5" /> },
    { name: 'المنسق الرئيسي', role: 'التنسيق والقرار', icon: <Rocket className="w-5 h-5" /> }
  ];

  // Initialize agents
  useEffect(() => {
    const initialAgents = agentDefinitions.map((def, idx) => ({
      id: `agent-${idx}`,
      name: def.name,
      role: def.role,
      status: 'idle' as const
    }));
    setAgents(initialAgents);
  }, []);

  const phases = [
    {
      id: 1,
      name: 'الملخص الإبداعي',
      nameEn: 'Creative Brief',
      description: 'تحديد الفكرة الأولية ووضع الأسس',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 2,
      name: 'توليد الأفكار',
      nameEn: 'Idea Generation',
      description: 'إنشاء فكرتين متنافستين مبتكرتين',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 3,
      name: 'المراجعة المستقلة',
      nameEn: 'Independent Review',
      description: 'تقييم شامل من كل وكيل',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 4,
      name: 'المناقشة التنافسية',
      nameEn: 'The Tournament',
      description: 'نقاش حي بين الوكلاء',
      icon: <Trophy className="w-5 h-5" />,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 5,
      name: 'القرار النهائي',
      nameEn: 'Final Decision',
      description: 'اختيار الفكرة الفائزة',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  const handleStartSession = async () => {
    if (!brief.trim()) {
      setError('يرجى إدخال ملخص الفكرة الإبداعية');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate session creation
      const newSession: Session = {
        id: `session-${Date.now()}`,
        brief,
        phase: 1,
        status: 'active',
        startTime: new Date()
      };

      setCurrentSession(newSession);
      setSessionActive(true);
      setActivePhase(1);
      setBrief('');

      // Simulate agent activation
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'working' as const })));

      // Simulate phase progression
      setTimeout(() => {
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' as const })));
        setActivePhase(2);
      }, 3000);

    } catch (err) {
      setError('فشل في إنشاء الجلسة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSession = () => {
    setSessionActive(false);
    setCurrentSession(null);
    setActivePhase(1);
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'idle' as const })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-blue-400 animate-pulse';
      case 'completed': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Jules Platform
        </h1>
        <p className="text-xl text-muted-foreground">
          منصة التطوير القصصي بالذكاء الاصطناعي متعدد الوكلاء
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">خطأ: {error}</p>
          </div>
        )}
        {currentSession && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600 font-medium">الجلسة الحالية: {currentSession.brief}</p>
            <p className="text-sm text-muted-foreground mt-1">
              الحالة: {currentSession.status} | المرحلة: {currentSession.phase}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Control Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-blue-500" />
                لوحة التحكم الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Process Phases */}
              <div>
                <h3 className="text-lg font-semibold mb-4">مراحل العملية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {phases.map((phase) => (
                    <Button
                      key={phase.id}
                      variant={activePhase === phase.id ? "default" : "outline"}
                      className={`p-4 h-auto flex items-center gap-3 ${
                        activePhase === phase.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setActivePhase(phase.id)}
                    >
                      {phase.icon}
                      <div className="text-left">
                        <p className="font-bold text-sm">{phase.name}</p>
                        <p className="text-xs opacity-75">{phase.nameEn}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Session Creation/Control */}
              {!currentSession ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ملخص الفكرة الإبداعية
                    </label>
                    <FileUpload
                      onFileContent={(content, filename) => {
                        setBrief(content);
                        setError(null);
                      }}
                      className="mb-4"
                    />
                    <Textarea
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="اكتب هنا الفكرة الأساسية لقصتك..."
                      className="min-h-[100px]"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    onClick={handleStartSession}
                    disabled={isLoading || !brief.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Settings className="w-5 h-5 mr-2 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        بدء جلسة جديدة
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">الملخص الإبداعي</h3>
                    <p className="text-sm">{currentSession.brief}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleStopSession}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      إيقاف الجلسة
                    </Button>
                  </div>

                  {sessionActive && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-600 font-medium">الجلسة نشطة الآن</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        الوكلاء يعملون على تطوير الأفكار...
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">التقدم العام</span>
                      <span className="text-sm font-medium">{((activePhase / 5) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(activePhase / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Agents Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-500" />
                فريق الوكلاء
              </CardTitle>
              <CardDescription>
                {agents.length} وكيل متخصص
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {agentDefinitions.map((def, index) => {
                    const agent = agents[index];
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="text-blue-500">{def.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{def.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{def.role}</p>
                          {agent?.lastMessage && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {agent.lastMessage}
                            </p>
                          )}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(agent?.status || 'idle')}`} />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          { icon: <Brain className="w-6 h-6" />, title: 'ذكاء اصطناعي متقدم', desc: '11 وكيل متخصص' },
          { icon: <FileText className="w-6 h-6" />, title: 'تطوير احترافي', desc: 'قصص مصقولة' },
          { icon: <Zap className="w-6 h-6" />, title: 'معالجة سريعة', desc: 'نتائج فورية' },
          { icon: <Shield className="w-6 h-6" />, title: 'جودة مضمونة', desc: 'مراجعة شاملة' }
        ].map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="text-blue-500 mb-4">{feature.icon}</div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
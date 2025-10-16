import { useState } from 'react';
import { FileText, Users, Brain, Sparkles, Play, Settings, BookOpen, Target, Trophy, MessageSquare, Zap, Shield, Cpu, Layers, Rocket } from 'lucide-react';

function App() {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  const phases = [
    {
      id: 1,
      name: 'الملخص الإبداعي',
      nameEn: 'Creative Brief',
      description: 'تحديد الفكرة الأولية ووضع الأسس',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 2,
      name: 'توليد الأفكار',
      nameEn: 'Idea Generation',
      description: 'إنشاء فكرتين متنافستين مبتكرتين',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 3,
      name: 'المراجعة المستقلة',
      nameEn: 'Independent Review',
      description: 'تقييم شامل من كل وكيل',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 4,
      name: 'المناقشة التنافسية',
      nameEn: 'The Tournament',
      description: 'نقاش حي بين الوكلاء',
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 5,
      name: 'القرار النهائي',
      nameEn: 'Final Decision',
      description: 'اختيار الفكرة الفائزة',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  const agents = [
    { name: 'مهندس القصة', role: 'البناء الهيكلي', icon: <Layers /> },
    { name: 'ناقد الواقعية', role: 'التحقق من المنطق', icon: <Shield /> },
    { name: 'مطور الشخصيات', role: 'عمق الشخصيات', icon: <Users /> },
    { name: 'منسق الحوارات', role: 'الحوارات الطبيعية', icon: <MessageSquare /> },
    { name: 'محلل السوق', role: 'الجدوى التجارية', icon: <Target /> },
    { name: 'خبير النوع', role: 'معايير النوع الأدبي', icon: <BookOpen /> },
    { name: 'محرر التوتر', role: 'الإيقاع والتشويق', icon: <Zap /> },
    { name: 'مستشار الثقافة', role: 'الحساسية الثقافية', icon: <Brain /> },
    { name: 'مخطط المشاهد', role: 'البناء البصري', icon: <FileText /> },
    { name: 'محلل المواضيع', role: 'العمق الموضوعي', icon: <Cpu /> },
    { name: 'المنسق الرئيسي', role: 'التنسيق والقرار', icon: <Rocket /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Jules Platform
          </h1>
          <p className="text-xl text-gray-300">
            منصة التطوير القصصي بالذكاء الاصطناعي متعدد الوكلاء
          </p>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Session Control */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-cyan-400" />
              لوحة التحكم الرئيسية
            </h2>

            {/* Process Phases */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-300">مراحل العملية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phases.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`p-4 rounded-xl text-white transition-all flex items-center gap-3 ${
                      activePhase === phase.id
                        ? `${phase.color} ring-4 ring-white/50`
                        : `${phase.color} hover:scale-105`
                    }`}
                  >
                    {phase.icon}
                    <div className="text-left">
                      <p className="font-bold">{phase.name}</p>
                      <p className="text-xs opacity-90">{phase.nameEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setSessionActive(!sessionActive)}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  sessionActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                }`}
              >
                {sessionActive ? (
                  <><Settings className="w-6 h-6 animate-spin" /> إيقاف الجلسة</>
                ) : (
                  <><Play className="w-6 h-6" /> بدء جلسة جديدة</>
                )}
              </button>
            </div>

            {sessionActive && (
              <div className="mt-6 p-4 bg-green-500/20 rounded-xl border border-green-500/50">
                <p className="text-green-400 font-semibold">الجلسة نشطة الآن</p>
                <p className="text-sm text-gray-300 mt-2">
                  الوكلاء يعملون على تطوير الأفكار...
                </p>
              </div>
            )}
          </div>

          {/* Agents Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              فريق الوكلاء
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agents.map((agent, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="text-cyan-400">{agent.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.role}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Brain className="w-8 h-8" />, title: 'ذكاء اصطناعي متقدم', desc: '11 وكيل متخصص' },
            { icon: <FileText className="w-8 h-8" />, title: 'تطوير احترافي', desc: 'قصص مصقولة' },
            { icon: <Zap className="w-8 h-8" />, title: 'معالجة سريعة', desc: 'نتائج فورية' },
            { icon: <Shield className="w-8 h-8" />, title: 'جودة مضمونة', desc: 'مراجعة شاملة' }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="text-cyan-400 mb-4">{feature.icon}</div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useStore, type Agent, type Idea } from '../store/useStore';
import { sessionService, wsService } from '../services/api';

type AgentUpdateMessage = {
  agentId: string;
  update: Partial<Agent>;
};

type PhaseChangeMessage = {
  phase: number;
};

type SessionCompleteMessage = {
  winner: Idea;
};

export const SessionManager: React.FC = () => {
  const [brief, setBrief] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    currentSession,
    setCurrentSession,
    setError,
    activePhase,
    setActivePhase,
    updateAgent,
    updateSession,
  } = useStore();

  useEffect(() => {
    if (currentSession) {
      // Connect to WebSocket for real-time updates
      wsService.connect(currentSession.id);
      
      // Listen for agent updates
      const unsubAgent = wsService.on('agent_update', (data: AgentUpdateMessage) => {
        updateAgent(data.agentId, data.update);
      });

      // Listen for phase changes
      const unsubPhase = wsService.on('phase_change', (data: PhaseChangeMessage) => {
        setActivePhase(data.phase);
        updateSession({ phase: data.phase });
      });

      // Listen for session completion
      const unsubComplete = wsService.on('session_complete', (data: SessionCompleteMessage) => {
        updateSession({
          status: 'completed',
          winner: data.winner,
          endTime: new Date()
        });
      });
      
      return () => {
        unsubAgent();
        unsubPhase();
        unsubComplete();
        wsService.disconnect();
      };
    }
  }, [currentSession, setActivePhase, updateAgent, updateSession]);

  const createSession = async () => {
    if (!brief.trim()) {
      setError('يرجى إدخال ملخص الفكرة');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const session = await sessionService.createSession(brief);
      setCurrentSession(session);
      setBrief('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('حدث خطأ في إنشاء الجلسة');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const pauseSession = () => {
    if (currentSession) {
      updateSession({ status: 'paused' });
      wsService.send('pause_session', { sessionId: currentSession.id });
    }
  };

  const resumeSession = () => {
    if (currentSession) {
      updateSession({ status: 'active' });
      wsService.send('resume_session', { sessionId: currentSession.id });
    }
  };

  const resetSession = () => {
    if (currentSession) {
      wsService.disconnect();
      setCurrentSession(null);
      setActivePhase(1);
    }
  };

  return (
    <section role="main" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold mb-6 text-white">إدارة الجلسة</h2>
      
      {!currentSession ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ملخص الفكرة الإبداعية
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="اكتب هنا الفكرة الأساسية لقصتك..."
              className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              rows={4}
              disabled={isCreating}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createSession}
            disabled={isCreating || !brief.trim()}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                بدء جلسة جديدة
              </>
            )}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Session Info */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">معرف الجلسة</span>
              <span className="text-sm font-mono text-cyan-400">{currentSession.id}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">الحالة</span>
              <StatusBadge status={currentSession.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">المرحلة الحالية</span>
              <span className="text-sm text-white">المرحلة {activePhase} من 5</span>
            </div>
          </div>
          
          {/* Brief Display */}
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-2">الملخص الإبداعي</h3>
            <p className="text-white">{currentSession.brief}</p>
          </div>
          
          {/* Control Buttons */}
          <div className="flex gap-3">
            {currentSession.status === 'active' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={pauseSession}
                className="flex-1 py-2 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                إيقاف مؤقت
              </motion.button>
            ) : currentSession.status === 'paused' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resumeSession}
                className="flex-1 py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                استئناف
              </motion.button>
            ) : null}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetSession}
              className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين
            </motion.button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">التقدم العام</span>
              <span className="text-sm text-white">{((activePhase / 5) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(activePhase / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { color: 'text-green-400', icon: <Loader className="w-4 h-4 animate-spin" />, label: 'نشط' };
      case 'paused':
        return { color: 'text-yellow-400', icon: <Pause className="w-4 h-4" />, label: 'متوقف' };
      case 'completed':
        return { color: 'text-blue-400', icon: <CheckCircle className="w-4 h-4" />, label: 'مكتمل' };
      case 'error':
        return { color: 'text-red-400', icon: <AlertCircle className="w-4 h-4" />, label: 'خطأ' };
      default:
        return { color: 'text-gray-400', icon: null, label: 'غير معروف' };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      {config.icon}
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

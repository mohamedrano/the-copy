import React from 'react';

interface ProgressIndicatorProps {
  stage: 'upload' | 'processing' | 'analyzing' | 'generating';
  fileName?: string;
}

const STAGES = {
  upload: { label: 'رفع الملفات', icon: '📤', progress: 25 },
  processing: { label: 'معالجة الملفات', icon: '⚙️', progress: 50 },
  analyzing: { label: 'تحليل المحتوى', icon: '🔍', progress: 75 },
  generating: { label: 'توليد النتائج', icon: '✨', progress: 90 },
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stage, fileName }) => {
  const current = STAGES[stage];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4 animate-bounce">{current.icon}</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            {current.label}
          </h3>
          {fileName && (
            <p className="text-sm text-slate-400">
              {fileName}
            </p>
          )}
        </div>

        <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${current.progress}%` }}
          />
        </div>

        <p className="text-center text-sm text-slate-400">
          {current.progress}% مكتمل
        </p>
      </div>
    </div>
  );
};




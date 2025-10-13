import React from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import ExternalAppFrame from '@/components/common/ExternalAppFrame';

interface ExportPageProps {
  onBack: () => void;
}

export default function ExportPage({ onBack }: ExportPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">التصدير (Multi-Agent Story)</h1>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>
        </div>

        <ExternalAppFrame title="قصة متعددة الوكلاء" url="/multi-agent-story/" />
      </div>
    </div>
  );
}

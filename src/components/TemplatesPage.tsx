import React from 'react';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import ExternalAppFrame from '@/components/common/ExternalAppFrame';

interface TemplatesPageProps {
  onBack: () => void;
}

export default function TemplatesPage({ onBack }: TemplatesPageProps) {
  const url = import.meta.env.VITE_STATIONS_URL || '/stations';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">القوالب (Stations)</h1>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>
        </div>

        <ExternalAppFrame url={url} title="Stations" />
      </div>
    </div>
  );
}

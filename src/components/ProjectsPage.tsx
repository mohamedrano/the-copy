import React from 'react';
import { ArrowRight, FolderOpen } from 'lucide-react';
import ExternalAppFrame from '@/components/common/ExternalAppFrame';

interface ProjectsPageProps {
  onBack: () => void;
}

export default function ProjectsPage({ onBack }: ProjectsPageProps) {
  const url = import.meta.env.VITE_DRAMA_ANALYST_URL || '/drama-analyst';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">المشاريع (Drama-Analyst)</h1>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>
        </div>

        <ExternalAppFrame url={url} title="Drama-Analyst" />
      </div>
    </div>
  );
}

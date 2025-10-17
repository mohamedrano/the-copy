import React from 'react';
import { Film, FileText, FolderOpen, LayoutTemplate, Download, Settings } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

/**
 * Landing page that presents shortcuts into the various authoring modules.
 *
 * @param onNavigate - Callback invoked when the user selects a destination.
 * @returns JSX markup describing the navigation hub.
 */
export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <Film className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">the copy</h1>
          <p className="text-xl text-gray-600">منصة متكاملة لكتابة وتحليل السيناريوهات العربية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => onNavigate('basic-editor')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <FileText className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">المحرر الأساسي</h3>
            <p className="text-gray-600">محرر بسيط وسريع لكتابة السيناريوهات</p>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <FolderOpen className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">محلل الدراما</h3>
            <p className="text-gray-600">تحليل متقدم للسيناريوهات والشخصيات</p>
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <LayoutTemplate className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">المحطات</h3>
            <p className="text-gray-600">محطات السيناريو والهيكل الدرامي</p>
          </button>

          <button
            onClick={() => onNavigate('export')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <Download className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">القصة متعددة الوكلاء</h3>
            <p className="text-gray-600">توليد قصص بواسطة وكلاء ذكاء اصطناعي</p>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <Settings className="w-12 h-12 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">الإعدادات</h3>
            <p className="text-gray-600">تخصيص وإعدادات التطبيق</p>
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Settings, ArrowRight } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Settings className="w-24 h-24 text-orange-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">الإعدادات</h1>
          <p className="text-xl text-gray-600 mb-8">
            صفحة الإعدادات والتخصيص قيد التطوير
          </p>
          <div className="bg-orange-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-2">الوظائف القادمة:</p>
            <ul className="text-right text-gray-600 space-y-2">
              <li>• تخصيص واجهة المستخدم</li>
              <li>• إعدادات التنسيق الافتراضية</li>
              <li>• إدارة مفاتيح API للذكاء الاصطناعي</li>
              <li>• تفضيلات اللغة والخط</li>
            </ul>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

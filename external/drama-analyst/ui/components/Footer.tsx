import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 text-center bg-slate-900 border-t border-slate-800 mt-12">
      <p className="text-sm text-slate-500">
        &copy; {new Date().getFullYear()} المحلل الدرامي. مدعوم بواسطة Google Gemini.
      </p>
      <p className="text-xs text-slate-600 mt-1">
        هذه أداة خيالية لأغراض توضيحية. يجب تكوين مفتاح API في البيئة.
      </p>
    </footer>
  );
};

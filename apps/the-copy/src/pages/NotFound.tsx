import type { JSX } from 'react';
import { Link } from 'react-router-dom';

export function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">الصفحة غير موجودة</h1>
        <p className="mt-3 text-sm text-slate-600">الصفحة التي تحاول الوصول إليها غير متاحة. يرجى العودة إلى الصفحة الرئيسية.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}

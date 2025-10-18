import type { JSX } from 'react';

interface AppErrorFallbackProps {
  app: string;
}

export function AppErrorFallback({ app }: AppErrorFallbackProps): JSX.Element {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-red-50">
      <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-5xl text-red-600" aria-hidden>
          ⚠️
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-800">تعذر تحميل {app}</h2>
        <p className="mb-4 text-sm text-slate-600">
          لم نتمكن من تحميل التطبيق البعيد. قد يعود ذلك إلى مشاكل في الشبكة أو عدم توافق في الإصدارات.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

import type { JSX } from 'react';

interface LoadingFallbackProps {
  app: string;
}

export function LoadingFallback({ app }: LoadingFallbackProps): JSX.Element {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="text-sm text-slate-600">جاري تحميل {app}...</p>
      </div>
    </div>
  );
}

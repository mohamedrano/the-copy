import React, { Component, ErrorInfo, ReactNode } from 'react';
import { log } from '@services/loggerService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public readonly props: Props;
  
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('❌ Error Boundary caught an error', { error, errorInfo }, 'ErrorBoundary');
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-4">
          <div className="max-w-2xl w-full bg-red-900/20 border border-red-500 rounded-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              ⚠️ حدث خطأ غير متوقع
            </h1>
            <p className="text-slate-300 mb-6">
              نعتذر عن هذا الخلل. يرجى إعادة تحميل الصفحة أو الاتصال بالدعم الفني.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-red-300 font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

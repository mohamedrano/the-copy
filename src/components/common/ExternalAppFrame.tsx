import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface ExternalAppFrameProps {
  title: string;
  url: string;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  retryDelay?: number;
  maxRetries?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ExternalAppFrame Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            خطأ في تحميل التطبيق
          </h3>
          <p className="text-gray-600 mb-4">
            حدث خطأ غير متوقع أثناء تحميل {this.props.children}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Embeds an external application inside an iframe with retry, loading, and
 * graceful error states tailored for the Naqid experience.
 *
 * @param props - Frame configuration describing the target URL and handlers.
 * @returns JSX rendering the iframe and associated status UI.
 */
const ExternalAppFrame: React.FC<ExternalAppFrameProps> = ({
  title,
  url,
  fallback,
  onError,
  onLoad,
  retryDelay = 3000,
  maxRetries = 3
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((errorMessage: string) => {
    setLoading(false);
    setError(errorMessage);
    onError?.(new Error(errorMessage));
  }, [onError]);

  const retry = useCallback(() => {
    if (retryCount >= maxRetries) {
      handleError('تم تجاوز الحد الأقصى من المحاولات');
      return;
    }

    setIsRetrying(true);
    setError(null);
    setRetryCount(prev => prev + 1);

    // Simulate retry delay
    window.setTimeout(() => {
      setIsRetrying(false);
      setLoading(true);
    }, retryDelay);
  }, [retryCount, maxRetries, retryDelay, handleError]);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < maxRetries) {
      const timer = window.setTimeout(retry, retryDelay);
      return () => window.clearTimeout(timer);
    }
  }, [error, retryCount, maxRetries, retryDelay, retry]);

  // Reset state when URL changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, [url]);

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600 mb-2">جاري تحميل {title}...</p>
      {retryCount > 0 && (
        <p className="text-sm text-gray-500">المحاولة {retryCount} من {maxRetries}</p>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        فشل تحميل {title}
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {retryCount < maxRetries ? (
        <button
          onClick={retry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isRetrying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          إعادة المحاولة
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            تم تجاوز الحد الأقصى من المحاولات
          </p>
          {fallback || (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة تحميل الصفحة
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ErrorBoundary onError={onError}>
      <div className="w-full h-full flex flex-col relative">
        {loading && !error && renderLoadingState()}
        {error && renderErrorState()}

        {!error && (
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={() => handleError('خطأ في الشبكة أو المحتوى')}
            allow="fullscreen; clipboard-read; clipboard-write; camera; microphone; geolocation"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            style={{ display: loading ? 'none' : 'block' }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ExternalAppFrame;

import React, { useState, useCallback } from 'react';
import { TaskType } from '@core/enums';
import { GeminiTaskResultData } from '@core/types';
import { ClipboardDocumentIcon } from '@ui/icons';
import { ENHANCED_TASK_DESCRIPTIONS as TASK_DESCRIPTIONS } from '@orchestration/orchestration';
import { ActionButton } from '@ui/components/ActionButton';
import { log } from '@services/loggerService';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      log.error('Failed to copy text', err, 'ResultsDisplay');
      alert('فشل نسخ النص!');
    }
  }, [textToCopy]);

  return (
    <button
      onClick={handleCopy}
      title={copied ? "تم النسخ!" : "نسخ المحتوى"}
      className={`p-1.5 text-slate-400 hover:text-primary-light transition-colors duration-150 rounded-md hover:bg-slate-700 ${className}`}
      aria-live="polite"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <ClipboardDocumentIcon className="w-5 h-5" />
      )}
    </button>
  );
};


interface ResultSectionProps {
  title: string;
  content?: string;
  isError?: boolean;
  children?: React.ReactNode;
}

const ResultSection: React.FC<ResultSectionProps> = ({ title, content, isError, children }) => {
  const cleanedContent = typeof content === 'string' ? content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") : undefined;

  return (
    <div className={`p-6 rounded-xl shadow-xl border ${isError ? 'bg-red-900 border-red-700' : 'bg-slate-800 border-panel-border backdrop-blur-xs bg-panel'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-2xl font-semibold ${isError ? 'text-red-200' : 'text-primary-light'}`}>{title}</h3>
        {cleanedContent && <CopyButton textToCopy={cleanedContent} />}
      </div>
      {cleanedContent && (
        <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-serif text-slate-200 max-h-[70vh] overflow-y-auto p-4 bg-slate-900/50 rounded-md">
          {cleanedContent}
        </pre>
      )}
      {children}
    </div>
  );
};

// Fix: Define the ResultsDisplayProps interface
interface ResultsDisplayProps {
  resultData?: GeminiTaskResultData | null;
  rawText?: string | null;
  error?: string | null;
  selectedTaskType: TaskType | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ resultData, rawText, error, selectedTaskType }) => {
  if (error) {
    return <ResultSection title="خطأ في المعالجة" content={error} isError />;
  }

  if (!resultData && !rawText) {
    return null; 
  }

  let displayTitle = "نتائج المعالجة";
  let mainDisplayContent: string | undefined = undefined;

  if (typeof resultData === 'string') {
    mainDisplayContent = resultData;
  } else if (rawText) {
    mainDisplayContent = rawText;
    displayTitle = "النص الخام المستلم";
  }

  if (!mainDisplayContent) {
    return <ResultSection title="لا توجد نتائج" content="لم يتم إرجاع أي محتوى قابل للعرض." isError/>;
  }

  // Further refine title based on specific task type
  if (selectedTaskType) {
    const taskDescription = TASK_DESCRIPTIONS[selectedTaskType];
    if (taskDescription) {
      displayTitle = taskDescription;
    } else {
      displayTitle = `نتائج مهمة: ${selectedTaskType}`;
    }
  }

  return (
    <div className="w-full space-y-8 mt-8">
      <ResultSection title={displayTitle} content={mainDisplayContent} />
    </div>
  );
};


import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { TaskCategory, TaskType } from '@core/enums';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader } from './components/Loader';
import { log } from '@services/loggerService';
import { getAnalyticsService } from '@services/analyticsService';
import { getUptimeMonitoringService } from '@services/uptimeMonitoringService';
import {
  AIResponse,
  CompletionEnhancementOption,
  PreviousCompletionContext,
  ProcessedFile,
  AgentId,
  AIRequest,
} from '@core/types';
import { ActionButton } from '@ui/components/ActionButton';
import { Footer } from '@ui/components/Footer';
import { Header } from '@ui/components/Header';
import { 
  LazyResultsDisplay,
  LazyTaskSelector,
  LazyFileUpload,
  LazyCompletionEnhancements,
  LazyRequirementsForm
} from '@ui/components/LazyComponents';
import { prepareFiles, submitTask } from '@orchestration/executor';
import {
  MIN_FILES_REQUIRED,
  TASKS_REQUIRING_COMPLETION_SCOPE,
  COMPLETION_ENHANCEMENT_OPTIONS,
  TASK_LABELS,
  TASK_CATEGORY_MAP,
} from '@core/constants';
import {
  SparklesIcon,
  LightBulbIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  BeakerIcon,
  ChartBarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FilmIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
} from '@ui/icons';
import { agentIdToTaskTypeMap } from '../agents/taskInstructions';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedFilesContent, setProcessedFilesContent] = useState<ProcessedFile[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [specialRequirements, setSpecialRequirements] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [completionScope, setCompletionScope] = useState<string>('');
  const [selectedCompletionEnhancements, setSelectedCompletionEnhancements] = useState<TaskType[]>([]);
  const [previousCompletionContext, setPreviousCompletionContext] = useState<PreviousCompletionContext | null>(null);
  const [usePreviousContextForCompletion, setUsePreviousContextForCompletion] = useState<boolean>(false);

  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKeyPresent, setApiKeyPresent] = useState<boolean>(!!import.meta.env.VITE_GEMINI_API_KEY);

  const generateFileHash = useCallback((files: ProcessedFile[]): string => {
    if (!files || files.length === 0) return '';
    const names = files.map(f => f.fileName).sort().join(',');
    const totalSize = files.reduce((acc, f) => acc + (f.sizeBytes ?? 0), 0);
    return `${names}-${totalSize}`;
  }, []);

  const flattenProcessedFiles = useCallback((files: ProcessedFile[]): string => {
    return files
      .map(file => {
        if (file.textContent) return file.textContent;
        if (file.bufferContentBase64) return `[binary:${file.fileName}]`;
        return '';
      })
      .filter(Boolean)
      .join('\n\n---\n\n');
  }, []);

  // Initialize app and track analytics
  useEffect(() => {
    log.info('🚀 Drama Analyst App initialized', null, 'App');

    // Track app initialization in analytics
    const analyticsService = getAnalyticsService();
    analyticsService?.sendEvent('page_view', {
      event_category: 'Page View',
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
    analyticsService?.sendEvent('app_initialized', {
      event_category: 'App Lifecycle',
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }, []);

  useEffect(() => {
    const processAndSetFiles = async () => {
      if (uploadedFiles.length === 0) {
        setProcessedFilesContent([]);
        setError(null);
        setPreviousCompletionContext(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSubmissionError(null);
      setPreviousCompletionContext(null);
      setUsePreviousContextForCompletion(false);

      try {
        const result = await prepareFiles({ files: uploadedFiles });
        if (result.ok) {
          setProcessedFilesContent(result.value);
        } else if ('error' in result) {
          const details = (result.error.cause as Record<string, unknown> | undefined) || {};
          const partialCandidate = details['partial'];
          const partial = Array.isArray(partialCandidate)
            ? (partialCandidate as ProcessedFile[])
            : [];
          const failuresCandidate = details['failures'];
          const failures = Array.isArray(failuresCandidate)
            ? (failuresCandidate as Array<{ fileName?: string; reason?: string }>)
            : [];
          setProcessedFilesContent(partial);
          const failureMessage = failures
            .map(entry => `${entry.fileName ?? 'unknown'}: ${entry.reason ?? 'Unknown error'}`)
            .join('\n');
          setError(failureMessage || result.error.message || 'An unknown error occurred during file processing.');
        }
      } catch (err: any) {
        log.error('Error processing files', err, 'App');
        setError(err?.message || 'An error occurred while processing files. Please check the console for details.');
        setProcessedFilesContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    processAndSetFiles();
  }, [uploadedFiles]);

  const handleFilesUploaded = useCallback((files: File[]) => {
    setUploadedFiles(files);
    setSubmissionError(null);
    setAiResponse(null);
    setPreviousCompletionContext(null);
    setUsePreviousContextForCompletion(false);
    setSelectedCompletionEnhancements([]);
  }, []);

  const handleTaskSelect = useCallback((task: TaskType) => {
    setSelectedTask(task);
    setSubmissionError(null);
    setAiResponse(null);
    if (!TASKS_REQUIRING_COMPLETION_SCOPE.includes(task)) {
      setCompletionScope('');
    }
    if (task !== TaskType.COMPLETION) {
      setSelectedCompletionEnhancements([]);
    }
    if (!TASKS_REQUIRING_COMPLETION_SCOPE.includes(task)) {
        setUsePreviousContextForCompletion(false);
    }
  }, []);

  const handleToggleEnhancement = useCallback((enhancementId: TaskType) => {
    setSelectedCompletionEnhancements(prev =>
      prev.includes(enhancementId)
        ? prev.filter(id => id !== enhancementId)
        : [...prev, enhancementId]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedTask || processedFilesContent.length < MIN_FILES_REQUIRED) {
      setSubmissionError(`Please upload at least ${MIN_FILES_REQUIRED} file(s), select a task, and ensure they are processed successfully before submitting.`);
      return;
    }
    if (TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) && !completionScope.trim()) {
      setSubmissionError(`For this task (${TASK_LABELS[selectedTask] || selectedTask}), please specify the "Desired Completion Scope".`);
      return;
    }

    setSubmissionError(null);
    setAiResponse(null);
    setIsLoading(true);

    let previousContextText: string | undefined = undefined;
    if (usePreviousContextForCompletion && previousCompletionContext && generateFileHash(processedFilesContent) === previousCompletionContext.filesHash) {
      previousContextText = previousCompletionContext.lastCompletionOutput;
    }

    const agentId = Object.keys(agentIdToTaskTypeMap).find(key => agentIdToTaskTypeMap[key as AgentId] === selectedTask) as AgentId;

    if (!agentId) {
        setSubmissionError(`Could not find a valid agent for the selected task: ${selectedTask}`);
        setIsLoading(false);
        return;
    }

    const request: AIRequest = {
        agent: agentId,
        prompt: specialRequirements,
        files: processedFilesContent,
        params: {
            additionalInfo,
            completionScope: TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) ? completionScope : undefined,
            selectedCompletionEnhancements: selectedTask === TaskType.COMPLETION ? selectedCompletionEnhancements : undefined,
            previousContextText,
        }
    };

    try {
      const result = await submitTask(request);

      if (result.ok) {
        setAiResponse(result.value);
        setApiKeyPresent(true);
        // تسجيل النجاح
        log.info('✅ Task completed successfully', {
          agent: request.agent,
          filesCount: request.files.length,
          timestamp: new Date().toISOString()
        });
        
        // Track task completion in analytics
        const analyticsService = getAnalyticsService();
        analyticsService?.sendEvent('task_completed', {
          event_category: 'Task Completion',
          agent: request.agent,
          file_count: request.files.length,
          total_file_size: request.files.reduce((sum, file) => sum + (file.sizeBytes || 0), 0),
          completion_scope: request.params?.completionScope,
          timestamp: Date.now()
        });
        
        // Track request in uptime monitoring
        const uptimeService = getUptimeMonitoringService();
        if (uptimeService) {
          uptimeService.incrementRequestCount();
        }
        if (TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) && result.value.raw && completionScope) {
          const currentFilesHash = generateFileHash(processedFilesContent);
          let baseContentForNextIteration = "";
          if (usePreviousContextForCompletion && previousCompletionContext && previousCompletionContext.filesHash === currentFilesHash) {
            baseContentForNextIteration = previousCompletionContext.lastCompletionOutput + "\n\n---\n\n" + result.value.raw;
          } else {
            baseContentForNextIteration = flattenProcessedFiles(processedFilesContent) + "\n\n---\n\n" + result.value.raw;
          }
          setPreviousCompletionContext({
            filesHash: currentFilesHash,
            originalTask: selectedTask,
            completionScopeOfResult: completionScope,
            lastCompletionOutput: baseContentForNextIteration,
          });
          setUsePreviousContextForCompletion(true);
        } else if (!TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask)){
           setPreviousCompletionContext(null);
           setUsePreviousContextForCompletion(false);
        }
      } else if ('error' in result) {
        setSubmissionError(result.error.message);
        if (result.error.message.toLowerCase().includes("api_key") || result.error.message.includes("مفتاح")) {
            setApiKeyPresent(false);
        }
        
        // Track task failure in analytics
        const analyticsService = getAnalyticsService();
        analyticsService?.sendEvent('task_failed', {
          event_category: 'Task Failure',
          agent: request.agent,
          error_type: result.error.type || 'unknown',
          error_message: result.error.message || 'Unknown error',
          file_count: request.files.length,
          timestamp: Date.now()
        });
        
        // Track error in uptime monitoring
        const uptimeService = getUptimeMonitoringService();
        if (uptimeService) {
          uptimeService.incrementErrorCount();
        }
      }
    } catch (e: any) {
      log.error("Submission error", e, 'App');
      setSubmissionError(e.message || "An unexpected error occurred during submission.");
       if (e.message && (e.message.toLowerCase().includes("api_key") || e.message.includes("مفتاح"))) {
            setApiKeyPresent(false);
        }
        
        // Track unexpected error in analytics
        const analyticsService = getAnalyticsService();
        analyticsService?.sendEvent('task_error', {
          event_category: 'Task Error',
          agent: request.agent,
          error_type: 'unexpected_error',
          error_message: e.message || 'Unknown error',
          file_count: request.files.length,
          timestamp: Date.now()
        });
        
        // Track error in uptime monitoring
        const uptimeService = getUptimeMonitoringService();
        if (uptimeService) {
          uptimeService.incrementErrorCount();
        }
    } finally {
      setIsLoading(false);
    }
  }, [
        processedFilesContent,
        selectedTask,
        specialRequirements,
        additionalInfo,
        completionScope,
        selectedCompletionEnhancements,
        usePreviousContextForCompletion,
        previousCompletionContext,
        generateFileHash
    ]);

  const isProcessingFiles = isLoading && uploadedFiles.length > 0 && processedFilesContent.length !== uploadedFiles.length;

  const getButtonIconAndText = () => {
    if (!selectedTask) return { icon: <SparklesIcon className="w-5 h-5" />, text: 'Start Processing' };

    const taskLabel = TASK_LABELS[selectedTask] || 'Process';
    const taskCategory = TASK_CATEGORY_MAP[selectedTask];

    let icon = <SparklesIcon className="w-5 h-5" />;

    switch (taskCategory) {
        case TaskCategory.CORE:
            if (selectedTask === TaskType.ANALYSIS) icon = <LightBulbIcon className="w-5 h-5" />;
            if (selectedTask === TaskType.CREATIVE) icon = <SparklesIcon className="w-5 h-5" />;
            if (selectedTask === TaskType.INTEGRATED) icon = <DocumentTextIcon className="w-5 h-5" />;
            if (selectedTask === TaskType.COMPLETION) icon = <PencilSquareIcon className="w-5 h-5" />;
            break;
        case TaskCategory.ANALYSIS:
            icon = <LightBulbIcon className="w-5 h-5" />;
            break;
        case TaskCategory.CREATIVE:
            icon = <SparklesIcon className="w-5 h-5" />;
            break;
        case TaskCategory.PREDICTIVE:
            icon = <BeakerIcon className="w-5 h-5" />;
            break;
        case TaskCategory.ADVANCED_MODULES:
            switch (selectedTask) {
                case TaskType.CHARACTER_DEEP_ANALYZER: icon = <UsersIcon className="w-5 h-5" />; break;
                case TaskType.DIALOGUE_ADVANCED_ANALYZER: icon = <MagnifyingGlassIcon className="w-5 h-5" />; break;
                case TaskType.VISUAL_CINEMATIC_ANALYZER: icon = <FilmIcon className="w-5 h-5" />; break;
                case TaskType.THEMES_MESSAGES_ANALYZER: icon = <LightBulbIcon className="w-5 h-5" />; break;
                case TaskType.CULTURAL_HISTORICAL_ANALYZER: icon = <GlobeAltIcon className="w-5 h-5" />; break;
                case TaskType.PRODUCIBILITY_ANALYZER: icon = <ChartBarIcon className="w-5 h-5" />; break;
                case TaskType.TARGET_AUDIENCE_ANALYZER: icon = <UsersIcon className="w-5 h-5" />; break;
                case TaskType.LITERARY_QUALITY_ANALYZER: icon = <PencilSquareIcon className="w-5 h-5" />; break;
                case TaskType.RECOMMENDATIONS_GENERATOR: icon = <SparklesIcon className="w-5 h-5" />; break;
                default: icon = <ClipboardDocumentIcon className="w-5 h-5" />; break;
            }
            break;
        default:
            break;
    }
    return { icon, text: taskLabel };
  };

  const { icon: buttonIcon, text: buttonText } = getButtonIconAndText();

  const isTaskRequiringScope = selectedTask && TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask);
  let submitDisabledReason = "";
    if (uploadedFiles.length < MIN_FILES_REQUIRED) {
        submitDisabledReason += `Please upload at least ${MIN_FILES_REQUIRED} file. `;
    }
    if (!selectedTask) {
        submitDisabledReason += 'Please select a service type. ';
    }
    if (isTaskRequiringScope && !completionScope.trim()) {
      submitDisabledReason += `For this task, please specify the "Desired Completion Scope". `;
    }
    if (isProcessingFiles) {
        submitDisabledReason += 'Processing uploaded files. Please wait. ';
    }
    if (error) {
        submitDisabledReason += `There is an error in file processing that prevents submission. `;
    }

  const isSubmitDisabled = !!submitDisabledReason.trim() || isLoading || !apiKeyPresent;

  const showIterativeCompletionOption =
    previousCompletionContext &&
    selectedTask &&
    TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) &&
    generateFileHash(processedFilesContent) === previousCompletionContext.filesHash;


  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      {isLoading && <Loader message={isProcessingFiles ? "Processing files..." : (selectedTask && TASK_LABELS[selectedTask] ? `Running ${TASK_LABELS[selectedTask]}...` : "Processing your request...")} />}
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12" data-testid="main-content">
        <div className="max-w-4xl mx-auto space-y-8">
          {!apiKeyPresent && (
            <div className="p-4 mb-6 bg-red-800 border border-red-600 text-red-100 rounded-lg shadow-lg" role="alert">
              <h3 className="font-bold text-lg">API Key Error</h3>
              <p>The Gemini API key is missing or invalid. Please ensure the <code>API_KEY</code> environment variable is configured correctly for the application. This application cannot function without a valid API key.</p>
            </div>
          )}
          {error && (
            <div className="p-4 mb-6 bg-yellow-700 border border-yellow-500 text-yellow-100 rounded-lg shadow-lg" role="alert">
              <h3 className="font-bold text-lg">File Processing Error</h3>
              <p>{error}</p>
            </div>
          )}

          <LazyFileUpload uploadedFiles={uploadedFiles} onFilesUploaded={handleFilesUploaded} />
          <LazyTaskSelector selectedTask={selectedTask} onTaskSelect={handleTaskSelect} />

          {selectedTask === TaskType.COMPLETION && (
            <LazyCompletionEnhancements
              availableEnhancements={COMPLETION_ENHANCEMENT_OPTIONS}
              selectedEnhancements={selectedCompletionEnhancements}
              onToggleEnhancement={handleToggleEnhancement}
            />
          )}

          {selectedTask && TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) && (
            <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel space-y-4">
              <div>
                <label htmlFor="completionScope" className="block text-lg font-medium text-slate-200 mb-2">
                  Desired Completion Scope <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="completionScope"
                  name="completionScope"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-400 text-sm"
                  placeholder="Example: one chapter, 3 scenes, until the end of the play, two episodes..."
                  value={completionScope}
                  onChange={(e) => setCompletionScope(e.target.value)}
                  aria-describedby="completionScopeHelp"
                />
                <p id="completionScopeHelp" className="mt-2 text-xs text-slate-400">
                  Please specify the extent of completion you desire for this task.
                </p>
              </div>
              {showIterativeCompletionOption && previousCompletionContext && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-md border border-slate-600">
                  <label htmlFor="usePreviousContext" className="flex items-center text-sm text-slate-200">
                    <input
                      type="checkbox"
                      id="usePreviousContext"
                      checked={usePreviousContextForCompletion}
                      onChange={(e) => setUsePreviousContextForCompletion(e.target.checked)}
                      className="me-2 h-4 w-4 rounded border-slate-500 bg-slate-600 text-primary focus:ring-primary-dark"
                    />
                    Use the result of the previous completion ("{previousCompletionContext.completionScopeOfResult}") as part of the current context for this set of files?
                  </label>
                  <p className="mt-1 text-xs text-slate-400">
                    This will send the original content plus the previous completion to the model to continue the work.
                  </p>
                </div>
              )}
            </div>
          )}
          <RequirementsForm
            specialRequirements={specialRequirements}
            additionalInfo={additionalInfo}
            onSpecialRequirementsChange={setSpecialRequirements}
            onAdditionalInfoChange={setAdditionalInfo}
          />
          <div className="text-center pt-4">
            <ActionButton
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              icon={buttonIcon}
              aria-label={buttonText}
              title={submitDisabledReason.trim() || buttonText}
            >
              {isLoading && !isProcessingFiles ? 'Submitting...' : buttonText}
            </ActionButton>
            {isSubmitDisabled && !isLoading && apiKeyPresent && (
                 <p className="text-sm text-yellow-400 mt-3" role="status">
                    {submitDisabledReason.trim()}
                </p>
            )}
             {isProcessingFiles && (
                <p className="text-sm text-blue-400 mt-3" role="status">
                    Processing files before submission...
                </p>
             )}
          </div>

          {submissionError && (
             <div className="p-4 mt-6 bg-red-800 border border-red-600 text-red-100 rounded-lg shadow-lg" role="alert">
                <h3 className="font-bold text-lg">Submission Error</h3>
                <p>{submissionError}</p>
            </div>
          )}

          {aiResponse && (
            <LazyResultsDisplay
              resultData={aiResponse.parsed as any}
              rawText={aiResponse.raw}
              error={null}
              selectedTaskType={selectedTask}
            />
          )}
        </div>
      </main>
      <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;

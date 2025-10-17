import React, { lazy, Suspense } from 'react';
import { Loader } from './Loader';

// Lazy load heavy components
const ResultsDisplay = lazy(() => import('./ResultsDisplay').then(module => ({ default: module.ResultsDisplay })));
const TaskSelector = lazy(() => import('./TaskSelector').then(module => ({ default: module.TaskSelector })));
const FileUpload = lazy(() => import('./FileUpload').then(module => ({ default: module.FileUpload })));
const CompletionEnhancements = lazy(() => import('./CompletionEnhancements').then(module => ({ default: module.CompletionEnhancements })));
const RequirementsForm = lazy(() => import('./RequirementsForm').then(module => ({ default: module.RequirementsForm })));

// Wrapper components with Suspense
export const LazyResultsDisplay: React.FC<any> = (props) => (
  <Suspense fallback={<Loader message="Loading results..." />}>
    <ResultsDisplay {...props} />
  </Suspense>
);

export const LazyTaskSelector: React.FC<any> = (props) => (
  <Suspense fallback={<div className="animate-pulse bg-slate-700 rounded-xl h-32"></div>}>
    <TaskSelector {...props} />
  </Suspense>
);

export const LazyFileUpload: React.FC<any> = (props) => (
  <Suspense fallback={<div className="animate-pulse bg-slate-700 rounded-xl h-40"></div>}>
    <FileUpload {...props} />
  </Suspense>
);

export const LazyCompletionEnhancements: React.FC<any> = (props) => (
  <Suspense fallback={<div className="animate-pulse bg-slate-700 rounded-xl h-24"></div>}>
    <CompletionEnhancements {...props} />
  </Suspense>
);

export const LazyRequirementsForm: React.FC<any> = (props) => (
  <Suspense fallback={<div className="animate-pulse bg-slate-700 rounded-xl h-32"></div>}>
    <RequirementsForm {...props} />
  </Suspense>
);

// Loading placeholders
export const TaskSelectorSkeleton = () => (
  <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel animate-pulse">
    <div className="h-8 bg-slate-700 rounded mb-6"></div>
    <div className="space-y-4">
      <div className="h-12 bg-slate-700 rounded"></div>
      <div className="h-12 bg-slate-700 rounded"></div>
      <div className="h-12 bg-slate-700 rounded"></div>
    </div>
  </div>
);

export const FileUploadSkeleton = () => (
  <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel animate-pulse">
    <div className="h-8 bg-slate-700 rounded mb-4"></div>
    <div className="h-32 bg-slate-700 rounded border-2 border-dashed border-slate-600"></div>
  </div>
);

export const ResultsDisplaySkeleton = () => (
  <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel animate-pulse">
    <div className="h-8 bg-slate-700 rounded mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
  </div>
);


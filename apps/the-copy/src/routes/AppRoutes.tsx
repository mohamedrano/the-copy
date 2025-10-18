import type { JSX } from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ShellHome } from '@/pages/ShellHome';
import { NotFound } from '@/pages/NotFound';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFallback } from '@/components/LoadingFallback';
import { AppErrorFallback } from '@/components/AppErrorFallback';

// @ts-ignore -- Module resolved at runtime via Module Federation remote exposure
const BasicEditor = lazy(() => import('basicEditor/App'));
// @ts-ignore -- Module resolved at runtime via Module Federation remote exposure
const DramaAnalyst = lazy(() => import('dramaAnalyst/App'));
// @ts-ignore -- Module resolved at runtime via Module Federation remote exposure
const MultiAgentStory = lazy(() => import('multiAgentStory/App'));
// @ts-ignore -- Module resolved at runtime via Module Federation remote exposure
const Stations = lazy(() => import('stations/App'));

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<ShellHome />} />
      <Route
        path="/basic-editor/*"
        element={
          <ErrorBoundary fallback={<AppErrorFallback app="المحرر الأساسي" />}>
            <Suspense fallback={<LoadingFallback app="المحرر الأساسي" />}>
              <BasicEditor />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path="/drama-analyst/*"
        element={
          <ErrorBoundary fallback={<AppErrorFallback app="محلل الدراما" />}>
            <Suspense fallback={<LoadingFallback app="محلل الدراما" />}>
              <DramaAnalyst />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path="/multi-agent-story/*"
        element={
          <ErrorBoundary fallback={<AppErrorFallback app="العصف الذهني متعدد الوكلاء" />}>
            <Suspense fallback={<LoadingFallback app="العصف الذهني متعدد الوكلاء" />}>
              <MultiAgentStory />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path="/stations/*"
        element={
          <ErrorBoundary fallback={<AppErrorFallback app="المحطات التحليلية" />}>
            <Suspense fallback={<LoadingFallback app="المحطات التحليلية" />}>
              <Stations />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

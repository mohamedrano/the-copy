import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@ui/App'; // Correct path to App.tsx in the same directory
import { initObservability } from '@services/observability';
import { cacheService } from '@services/cacheService';

// Initialize services (Sentry + Web Vitals + Analytics)
initObservability();

// Initialize cache service (this will register the service worker)
cacheService;

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
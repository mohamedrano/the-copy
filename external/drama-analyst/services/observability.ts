import * as Sentry from '@sentry/react';
import { log } from './loggerService';
import { setGAUserProperties, sendGAEvent } from './analyticsService';
import { initUptimeMonitoring } from './uptimeMonitoringService';

// Sentry configuration for production monitoring
export const initObservability = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;
  const isProduction = environment === 'production';
  
  if (dsn) {
    log.info('🔍 Initializing Sentry observability...', { environment }, 'Observability');
    
    Sentry.init({
      dsn,
      environment,
      
      // Performance Monitoring
      tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
      replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      
      // Error Filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors in production
        if (isProduction) {
          const error = hint.originalException;
          
          // Skip common browser errors
          if (error instanceof Error) {
            if (error.message.includes('ResizeObserver loop limit exceeded')) {
              return null;
            }
            if (error.message.includes('Non-Error promise rejection')) {
              return null;
            }
            if (error.message.includes('Script error')) {
              return null;
            }
          }
          
          // Skip network errors for failed resources
          if (event.exception) {
            const errorMessage = event.exception.values?.[0]?.value || '';
            if (errorMessage.includes('Failed to fetch') || 
                errorMessage.includes('NetworkError') ||
                errorMessage.includes('Load failed')) {
              return null;
            }
          }
        }
        
        // Add custom context
        event.tags = {
          ...event.tags,
          component: 'drama-analyst',
          version: import.meta.env.VITE_APP_VERSION || '1.0.0'
        };
        
        event.user = {
          ...event.user,
          id: getUserId(),
          session_id: getSessionId()
        };
        
        return event;
      },
      
      // Integrations
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
          networkDetailAllowUrls: [
            /^https:\/\/api\.gemini\.google\.com/,
            /^https:\/\/fonts\.googleapis\.com/,
            /^https:\/\/fonts\.gstatic\.com/
          ]
        }),
        Sentry.browserTracingIntegration({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            // React Router v6 instrumentation will be added when router is implemented
          )
        })
      ],
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Additional options
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      sendDefaultPii: false,
      
      // Performance monitoring
      enableTracing: true,
      
      // Session tracking
      autoSessionTracking: true,
      
      // Error boundaries
      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === 'console' && 
            breadcrumb.level === 'debug') {
          return null;
        }
        return breadcrumb;
      }
    });
    
    // Set user context
    Sentry.setUser({
      id: getUserId(),
      session_id: getSessionId()
    });
    
    // Set additional context
    Sentry.setContext('app', {
      name: 'Drama Analyst',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment
    });
    
    // Set tags
    Sentry.setTag('app', 'drama-analyst');
    Sentry.setTag('platform', 'web');
    
    log.info('✅ Sentry initialized successfully', { environment }, 'Observability');
  } else {
    log.warn('⚠️ Sentry DSN not configured', null, 'Observability');
  }

  // Performance Monitoring
  initPerformanceMonitoring();
  
  // Web Vitals Monitoring
  initWebVitalsMonitoring();
  
  // Analytics Monitoring
  initAnalyticsMonitoring();
  
  // Uptime Monitoring
  initUptimeMonitoring();
};

// Performance monitoring setup
const initPerformanceMonitoring = () => {
  if (typeof PerformanceObserver === 'undefined') {
    log.warn('⚠️ PerformanceObserver not supported', null, 'Observability');
    return;
  }

  // Core Web Vitals observer
  const vitalsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'measure') {
        log.debug(`[PERF] ${entry.name}: ${entry.duration.toFixed(2)}ms`, null, 'Observability');
        
        // Send critical performance metrics to Sentry
        if (entry.name.includes('critical') || entry.duration > 1000) {
          Sentry.addBreadcrumb({
            message: `Performance: ${entry.name}`,
            category: 'performance',
            level: 'info',
            data: {
              duration: entry.duration,
              startTime: entry.startTime
            }
          });
        }
      }
    });
  });
  
  vitalsObserver.observe({ entryTypes: ['measure'] });
  
  // Long task observer
  const longTaskObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) { // Tasks longer than 50ms
        Sentry.addBreadcrumb({
          message: 'Long task detected',
          category: 'performance',
          level: 'warning',
          data: {
            duration: entry.duration,
            startTime: entry.startTime
          }
        });
      }
    });
  });
  
  longTaskObserver.observe({ entryTypes: ['longtask'] });
  
  // Navigation timing
  const navObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        
        Sentry.addBreadcrumb({
          message: 'Navigation timing',
          category: 'navigation',
          level: 'info',
          data: {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart
          }
        });
      }
    });
  });
  
  navObserver.observe({ entryType: 'navigation' });
};

// Web Vitals monitoring
const initWebVitalsMonitoring = () => {
  // Initialize Web Vitals service
  import('./webVitalsService').then(({ initWebVitals }) => {
    const webVitalsConfig = {
      enableGA4: !!import.meta.env.VITE_GA4_MEASUREMENT_ID,
      enableSentry: !!dsn,
      enableConsoleLog: !isProduction,
      debug: !isProduction
    };
    
    initWebVitals(webVitalsConfig);
    log.info('📊 Web Vitals monitoring initialized', webVitalsConfig, 'Observability');
  }).catch(error => {
    log.error('❌ Failed to initialize Web Vitals monitoring', error, 'Observability');
  });
};

// Utility functions
const getUserId = (): string => {
  // Generate or retrieve user ID
  let userId = localStorage.getItem('drama_analyst_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('drama_analyst_user_id', userId);
  }
  return userId;
};

const getSessionId = (): string => {
  // Generate or retrieve session ID
  let sessionId = sessionStorage.getItem('drama_analyst_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('drama_analyst_session_id', sessionId);
  }
  return sessionId;
};

// Export Sentry utilities for manual error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  log.error('🚨 Manual error report', error, 'Observability', context);
  Sentry.captureException(error, { extra: context });
};

export const reportMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  log.info(`📝 Manual message report: ${message}`, null, 'Observability');
  Sentry.captureMessage(message, level);
};

export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data
  });
};

export const setUserContext = (user: { id?: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const setContext = (key: string, context: Record<string, any>) => {
  Sentry.setContext(key, context);
};

// Analytics monitoring setup
const initAnalyticsMonitoring = () => {
  const ga4Id = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const environment = import.meta.env.MODE;
  
  if (ga4Id) {
    log.info('📊 Initializing Google Analytics 4...', { ga4Id, environment }, 'Observability');
    
    // Import and initialize GA4
    import('./analyticsService').then(({ initGA4 }) => {
      initGA4(ga4Id);
      
      // Set user context for GA4
      setGAUserProperties({
        app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment,
        platform: 'web',
        session_id: getSessionId()
      });
      
      // Track app initialization
      sendGAEvent('app_initialized', {
        app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment,
        timestamp: new Date().toISOString()
      });
      
      log.info('✅ Google Analytics 4 initialized successfully', null, 'Observability');
    }).catch(error => {
      log.error('❌ Failed to initialize Google Analytics 4', error, 'Observability');
    });
  } else {
    log.warn('⚠️ Google Analytics 4 Measurement ID not configured', null, 'Observability');
  }
};

// Uptime monitoring setup
const initUptimeMonitoring = () => {
  const environment = import.meta.env.MODE;
  const isProduction = environment === 'production';
  
  log.info('📊 Initializing Uptime monitoring...', { environment }, 'Observability');
  
  // Import and initialize Uptime monitoring
  import('./uptimeMonitoringService').then(({ initUptimeMonitoring: initUptime }) => {
    const uptimeConfig = {
      enableGA4: !!import.meta.env.VITE_GA4_MEASUREMENT_ID,
      enableSentry: !!dsn,
      enableConsoleLog: !isProduction,
      debug: !isProduction,
      healthCheckInterval: 30000, // 30 seconds
      performanceCheckInterval: 60000 // 1 minute
    };

    initUptime(uptimeConfig);
    log.info('✅ Uptime monitoring initialized successfully', uptimeConfig, 'Observability');
  }).catch(error => {
    log.error('❌ Failed to initialize Uptime monitoring', error, 'Observability');
  });
};



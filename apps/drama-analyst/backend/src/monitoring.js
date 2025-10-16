// Backend Monitoring Service for Drama Analyst
// Handles error tracking, performance monitoring, and analytics

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

class MonitoringService {
  constructor() {
    this.isInitialized = false;
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeConnections: 0
    };
  }

  // Initialize monitoring
  init() {
    if (this.isInitialized) {
      return;
    }

    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.NODE_ENV || 'development';
    const isProduction = environment === 'production';

    if (dsn) {
      console.log('🔍 Initializing backend monitoring...');

      Sentry.init({
        dsn,
        environment,
        
        // Performance Monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0,
        profilesSampleRate: isProduction ? 0.1 : 1.0,
        
        // Integrations
        integrations: [
          new ProfilingIntegration(),
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: null }), // Will be set later
          new Sentry.Integrations.OnUncaughtException({
            exitEvenIfOtherHandlersAreRegistered: false,
          }),
          new Sentry.Integrations.OnUnhandledRejection({
            mode: 'warn',
          }),
        ],
        
        // Release tracking
        release: process.env.APP_VERSION || '1.0.0',
        
        // Additional options
        maxBreadcrumbs: 50,
        attachStacktrace: true,
        sendDefaultPii: false,
        
        // Error filtering
        beforeSend(event, hint) {
          // Filter out non-critical errors in production
          if (isProduction) {
            const error = hint.originalException;
            
            if (error instanceof Error) {
              // Skip common Node.js errors
              if (error.message.includes('ECONNRESET') ||
                  error.message.includes('EPIPE') ||
                  error.message.includes('ETIMEDOUT')) {
                return null;
              }
            }
          }
          
          // Add custom context
          event.tags = {
            ...event.tags,
            component: 'drama-analyst-backend',
            version: process.env.APP_VERSION || '1.0.0'
          };
          
          return event;
        },
        
        // Breadcrumb filtering
        beforeBreadcrumb(breadcrumb) {
          // Filter out noisy breadcrumbs
          if (breadcrumb.category === 'console' && 
              breadcrumb.level === 'debug') {
            return null;
          }
          return breadcrumb;
        }
      });

      // Set additional context
      Sentry.setContext('app', {
        name: 'Drama Analyst Backend',
        version: process.env.APP_VERSION || '1.0.0',
        environment,
        nodeVersion: process.version,
        platform: process.platform
      });

      // Set tags
      Sentry.setTag('app', 'drama-analyst-backend');
      Sentry.setTag('platform', 'node');
      Sentry.setTag('runtime', 'nodejs');

      this.isInitialized = true;
      console.log('✅ Backend monitoring initialized successfully');
    } else {
      console.warn('⚠️ Sentry DSN not configured for backend');
    }
  }

  // Express middleware for request tracking
  requestHandler() {
    return Sentry.requestHandler();
  }

  // Express middleware for tracing
  tracingHandler() {
    return Sentry.tracingHandler();
  }

  // Error handler middleware
  errorHandler() {
    return Sentry.errorHandler();
  }

  // Custom error reporting
  reportError(error, context = {}) {
    console.error('🚨 Backend error report:', error.message, context);
    Sentry.captureException(error, { extra: context });
    this.metrics.errors++;
  }

  // Custom message reporting
  reportMessage(message, level = 'info', context = {}) {
    console.log(`📝 Backend message report [${level}]:`, message, context);
    Sentry.captureMessage(message, level, { extra: context });
  }

  // Performance tracking
  trackPerformance(operation, startTime) {
    const duration = Date.now() - startTime;
    
    // Add to metrics
    this.metrics.responseTime.push(duration);
    
    // Keep only last 100 measurements
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }

    // Report slow operations
    if (duration > 1000) { // Operations longer than 1 second
      this.reportMessage(
        `Slow operation detected: ${operation}`,
        'warning',
        { operation, duration }
      );
    }

    // Add performance breadcrumb
    Sentry.addBreadcrumb({
      message: `Performance: ${operation}`,
      category: 'performance',
      level: 'info',
      data: {
        operation,
        duration,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Request tracking
  trackRequest(req, res, next) {
    const startTime = Date.now();
    this.metrics.requests++;
    this.metrics.activeConnections++;

    // Add request breadcrumb
    Sentry.addBreadcrumb({
      message: `${req.method} ${req.url}`,
      category: 'http',
      level: 'info',
      data: {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
      }
    });

    // Set user context if available
    if (req.user) {
      Sentry.setUser({
        id: req.user.id,
        email: req.user.email
      });
    }

    // Track response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.trackPerformance(`${req.method} ${req.url}`, startTime);
      this.metrics.activeConnections--;

      // Report slow requests
      if (duration > 5000) { // Requests longer than 5 seconds
        this.reportMessage(
          `Slow request detected: ${req.method} ${req.url}`,
          'warning',
          {
            method: req.method,
            url: req.url,
            duration,
            statusCode: res.statusCode
          }
        );
      }
    });

    next();
  }

  // API call tracking
  trackAPICall(apiName, startTime, success = true, error = null) {
    const duration = Date.now() - startTime;
    
    Sentry.addBreadcrumb({
      message: `API Call: ${apiName}`,
      category: 'api',
      level: success ? 'info' : 'error',
      data: {
        apiName,
        duration,
        success,
        error: error ? error.message : null,
        timestamp: new Date().toISOString()
      }
    });

    if (!success && error) {
      this.reportError(error, { apiName, duration });
    }
  }

  // Database operation tracking
  trackDatabaseOperation(operation, startTime, success = true, error = null) {
    const duration = Date.now() - startTime;
    
    Sentry.addBreadcrumb({
      message: `Database: ${operation}`,
      category: 'database',
      level: success ? 'info' : 'error',
      data: {
        operation,
        duration,
        success,
        error: error ? error.message : null,
        timestamp: new Date().toISOString()
      }
    });

    if (!success && error) {
      this.reportError(error, { operation, duration });
    }
  }

  // Health check metrics
  getHealthMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      activeConnections: this.metrics.activeConnections,
      averageResponseTime: Math.round(avgResponseTime),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // Custom context setters
  setUser(user) {
    Sentry.setUser(user);
  }

  setTag(key, value) {
    Sentry.setTag(key, value);
  }

  setContext(key, context) {
    Sentry.setContext(key, context);
  }

  // Cleanup
  close() {
    if (this.isInitialized) {
      Sentry.close(2000); // Wait 2 seconds for events to be sent
      this.isInitialized = false;
      console.log('🔒 Monitoring service closed');
    }
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Export functions for easy use
module.exports = {
  init: () => monitoringService.init(),
  requestHandler: () => monitoringService.requestHandler(),
  tracingHandler: () => monitoringService.tracingHandler(),
  errorHandler: () => monitoringService.errorHandler(),
  trackRequest: (req, res, next) => monitoringService.trackRequest(req, res, next),
  trackAPICall: (apiName, startTime, success, error) => 
    monitoringService.trackAPICall(apiName, startTime, success, error),
  trackDatabaseOperation: (operation, startTime, success, error) => 
    monitoringService.trackDatabaseOperation(operation, startTime, success, error),
  reportError: (error, context) => monitoringService.reportError(error, context),
  reportMessage: (message, level, context) => 
    monitoringService.reportMessage(message, level, context),
  getHealthMetrics: () => monitoringService.getHealthMetrics(),
  setUser: (user) => monitoringService.setUser(user),
  setTag: (key, value) => monitoringService.setTag(key, value),
  setContext: (key, context) => monitoringService.setContext(key, context),
  close: () => monitoringService.close()
};


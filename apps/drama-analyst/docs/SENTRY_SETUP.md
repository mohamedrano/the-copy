# 🔍 Sentry Setup Guide for Drama Analyst

## 📋 Overview

This guide explains how to set up Sentry for comprehensive error tracking, performance monitoring, and user session replay in the Drama Analyst application.

## 🚀 Quick Setup

### 1. Create Sentry Project

1. Go to [Sentry.io](https://sentry.io) and create an account
2. Create a new project:
   - **Platform**: React (for frontend)
   - **Platform**: Node.js (for backend)
   - **Organization**: `drama-analyst-org`
   - **Project Name**: `drama-analyst`

### 2. Get Your DSN

After creating the project, you'll get a DSN (Data Source Name) that looks like:
```
https://your-dsn@sentry.io/project-id
```

### 3. Environment Variables

Add these environment variables to your `.env` file:

```bash
# Frontend Sentry Configuration
VITE_SENTRY_DSN=your_frontend_dsn_here
VITE_SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
VITE_APP_VERSION=1.0.0

# Backend Sentry Configuration
SENTRY_DSN=your_backend_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

## 🔧 Configuration Details

### Frontend Configuration

The frontend Sentry is configured in `services/observability.ts` with:

- **Error Tracking**: Automatic error capture with filtering
- **Performance Monitoring**: Core Web Vitals and custom metrics
- **Session Replay**: User session recording for debugging
- **Release Tracking**: Automatic version tracking
- **User Context**: Anonymous user identification

### Backend Configuration

The backend Sentry is configured in `backend/src/monitoring.js` with:

- **Request Tracking**: All HTTP requests and responses
- **Error Handling**: Comprehensive error reporting
- **Performance Metrics**: API call timing and database operations
- **Health Monitoring**: System health and resource usage
- **Graceful Shutdown**: Proper cleanup on server shutdown

## 📊 Features Enabled

### Error Tracking
- ✅ Automatic error capture
- ✅ Custom error filtering
- ✅ Error context and breadcrumbs
- ✅ User and session information
- ✅ Source map support for debugging

### Performance Monitoring
- ✅ Core Web Vitals (CLS, FID, LCP, FCP, TTFB)
- ✅ Long task detection
- ✅ Navigation timing
- ✅ API call performance
- ✅ Database operation timing

### Session Replay
- ✅ User session recording
- ✅ Network request logging
- ✅ Console log capture
- ✅ DOM mutations tracking

### Release Tracking
- ✅ Automatic release creation
- ✅ Deployment tracking
- ✅ Source map upload
- ✅ Performance regression detection

## 🛠️ Advanced Configuration

### Custom Error Filtering

The configuration includes smart error filtering to reduce noise:

```javascript
// Frontend filtering
beforeSend(event, hint) {
  if (isProduction) {
    const error = hint.originalException;
    
    // Skip common browser errors
    if (error?.message?.includes('ResizeObserver loop limit exceeded')) {
      return null;
    }
    
    // Skip network errors for failed resources
    if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
      return null;
    }
  }
  
  return event;
}
```

### Performance Sampling

```javascript
// Different sampling rates for different environments
tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
replaysOnErrorSampleRate: 1.0,
```

### Custom Context

```javascript
// Set application context
Sentry.setContext('app', {
  name: 'Drama Analyst',
  version: '1.0.0',
  environment: 'production'
});

// Set user context
Sentry.setUser({
  id: getUserId(),
  session_id: getSessionId()
});
```

## 📈 Monitoring Dashboard

### Key Metrics to Monitor

1. **Error Rate**: Track error frequency and types
2. **Performance**: Monitor Core Web Vitals and API response times
3. **User Experience**: Session replay for user journey analysis
4. **System Health**: Backend resource usage and health checks

### Alerts Setup

Recommended alerts:

1. **Error Rate Spike**: Alert when error rate increases by 50%
2. **Performance Degradation**: Alert when response times exceed thresholds
3. **Critical Errors**: Immediate alerts for unhandled exceptions
4. **System Health**: Alert when backend health checks fail

## 🔒 Security Considerations

### Data Privacy
- ✅ No PII (Personally Identifiable Information) is sent
- ✅ User IDs are anonymous and randomly generated
- ✅ Session data is sanitized before transmission

### Network Security
- ✅ All data is sent over HTTPS
- ✅ DSN tokens are stored in environment variables
- ✅ Source maps are uploaded securely

### Compliance
- ✅ GDPR compliant (no personal data collected)
- ✅ Configurable data retention policies
- ✅ User consent for session replay (if required)

## 🚨 Troubleshooting

### Common Issues

#### 1. Sentry Not Initializing
```bash
# Check environment variables
echo $VITE_SENTRY_DSN
echo $SENTRY_DSN
```

#### 2. Source Maps Not Working
```bash
# Verify auth token
echo $VITE_SENTRY_AUTH_TOKEN

# Check build configuration
npm run build
```

#### 3. Too Many Errors
- Review error filtering configuration
- Adjust sampling rates
- Check for development-only errors

#### 4. Performance Impact
- Reduce sampling rates in production
- Optimize breadcrumb collection
- Use selective instrumentation

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
// In observability.ts
Sentry.init({
  debug: true, // Enable debug logging
  // ... other options
});
```

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [React Integration Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Node.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/node/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**: Review error trends and performance metrics
2. **Monthly**: Update Sentry SDK versions
3. **Quarterly**: Review and optimize sampling rates
4. **As Needed**: Update alert thresholds based on usage patterns

### Version Updates

```bash
# Update Sentry packages
npm update @sentry/react @sentry/vite-plugin
npm update @sentry/node @sentry/profiling-node

# Test configuration
npm run build
npm run test
```

---

**Need Help?** Check the [Sentry Community](https://forum.sentry.io/) or create an issue in the repository.


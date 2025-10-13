# ADR-002: Backend Proxy for Security

## Status

**Accepted** - 2024-01-15

## Context

The Drama Analyst application requires secure access to AI services (Google Gemini API) while maintaining:

- **API Key Security**: AI API keys must not be exposed to client-side code
- **Rate Limiting**: Prevent abuse and manage API costs
- **Input Sanitization**: Protect against XSS and injection attacks
- **CORS Protection**: Control cross-origin access
- **Monitoring**: Track usage, errors, and performance
- **Scalability**: Handle multiple concurrent requests efficiently

Direct client-side API calls would expose sensitive API keys and lack centralized security controls.

## Decision

We will implement a **Backend Proxy** using Node.js and Fastify to handle all AI service communications.

### Architecture

```
Client (React) → Backend Proxy (Fastify) → AI Services (Gemini)
```

### Key Components

1. **Fastify Server**: High-performance Node.js web framework
2. **Rate Limiting**: 10 requests per minute per IP with configurable limits
3. **Input Sanitization**: DOMPurify for XSS protection and input validation
4. **CORS Protection**: Restrictive CORS policies for production
5. **Health Monitoring**: Comprehensive health checks and metrics
6. **Error Handling**: Structured error responses with appropriate HTTP codes
7. **Security Headers**: Helmet.js for security headers

### Implementation Details

```javascript
// Rate limiting configuration
await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
  keyGenerator: (request) => {
    return request.headers['x-forwarded-for'] ||
           request.headers['x-real-ip'] ||
           request.ip;
  }
});

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  // Handle objects and arrays...
};

// CORS configuration
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
});
```

### Security Features

- **API Key Protection**: Keys stored server-side in environment variables
- **Rate Limiting**: Prevents abuse and manages costs
- **Input Validation**: JSON schema validation for all inputs
- **XSS Protection**: DOMPurify sanitization for all user inputs
- **CORS Restriction**: Production-only CORS policies
- **Security Headers**: Helmet.js for comprehensive security headers
- **Error Sanitization**: Safe error messages without sensitive information

### Monitoring and Observability

- **Health Endpoints**: `/health` for service monitoring
- **Request Tracking**: Comprehensive request/response logging
- **Error Reporting**: Sentry integration for error tracking
- **Performance Metrics**: Response times, memory usage, active connections
- **API Documentation**: OpenAPI/Swagger documentation

## Consequences

### Positive

- **Security**: API keys and sensitive data protected server-side
- **Control**: Centralized rate limiting and access control
- **Monitoring**: Comprehensive observability and error tracking
- **Scalability**: Can handle multiple clients and scale independently
- **Maintainability**: Single point of control for API changes
- **Cost Management**: Rate limiting prevents excessive API usage
- **Compliance**: Better audit trail and security compliance

### Negative

- **Complexity**: Additional server component to maintain
- **Latency**: Extra network hop adds ~50-100ms latency
- **Infrastructure**: Requires server hosting and monitoring
- **Single Point of Failure**: Backend proxy becomes critical dependency
- **Development Overhead**: More complex development and deployment

### Implementation Challenges

- **Deployment**: Need to deploy and manage backend service
- **Scaling**: Backend proxy needs to scale with demand
- **Monitoring**: Additional monitoring requirements for backend service
- **Error Handling**: Coordinating error handling between frontend and backend

### Mitigation Strategies

- **Dockerization**: Containerized deployment for easy scaling
- **Health Checks**: Comprehensive health monitoring and alerting
- **Load Balancing**: Multiple backend instances for high availability
- **Caching**: Response caching to reduce API calls and latency
- **Graceful Degradation**: Fallback mechanisms for backend failures

## Related Decisions

- [ADR-001: Agent-Based Architecture](./ADR-001-agent-based-architecture.md)
- [ADR-006: Docker Containerization](./ADR-006-docker-containerization.md)
- [ADR-007: CI/CD Pipeline Strategy](./ADR-007-ci-cd-pipeline.md)

## Implementation Status

- ✅ Fastify server with security middleware implemented
- ✅ Rate limiting and CORS protection configured
- ✅ Input sanitization with DOMPurify working
- ✅ Health monitoring and metrics collection
- ✅ Sentry integration for error tracking
- ✅ OpenAPI/Swagger documentation
- ✅ Docker containerization ready
- ✅ CI/CD pipeline configured


import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createDOMPurify } from 'dompurify';
import { JSDOM } from 'jsdom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize monitoring (CommonJS require for Sentry)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const monitoring = require('./monitoring.js');

// Initialize monitoring first
monitoring.init();

// Initialize DOMPurify for sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Initialize Fastify with security logging
const fastify = Fastify({ 
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  }
});

// Add monitoring middleware
fastify.addHook('onRequest', monitoring.trackRequest);

// Security middleware
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// CORS configuration - restrictive for production
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
});

// Rate limiting - 10 requests per minute per IP
await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
  keyGenerator: (request) => {
    return request.headers['x-forwarded-for'] || 
           request.headers['x-real-ip'] || 
           request.ip;
  },
  errorResponseBuilder: (request, context) => ({
    code: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.round(context.timeWindow / 1000)
  })
});

// Input sanitization utility
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, { 
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

// Swagger UI endpoint
fastify.get('/docs', async (request, reply) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const swaggerHtmlPath = path.join(process.cwd(), 'swagger-ui.html');
    const html = fs.readFileSync(swaggerHtmlPath, 'utf8');
    
    return reply.type('text/html').send(html);
  } catch (error) {
    fastify.log.error('Failed to serve Swagger UI:', error);
    return reply.code(500).send({
      code: 'DOCS_ERROR',
      message: 'Failed to load API documentation'
    });
  }
});

// OpenAPI specification endpoint
fastify.get('/openapi.yaml', async (request, reply) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const openApiPath = path.join(process.cwd(), 'openapi.yaml');
    const yaml = fs.readFileSync(openApiPath, 'utf8');
    
    return reply.type('text/yaml').send(yaml);
  } catch (error) {
    fastify.log.error('Failed to serve OpenAPI spec:', error);
    return reply.code(500).send({
      code: 'OPENAPI_ERROR',
      message: 'Failed to load OpenAPI specification'
    });
  }
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const metrics = monitoring.getHealthMetrics();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      metrics: {
        uptime: Math.round(metrics.uptime),
        requests: metrics.requests,
        errors: metrics.errors,
        activeConnections: metrics.activeConnections,
        averageResponseTime: metrics.averageResponseTime,
        memoryUsage: {
          rss: Math.round(metrics.memoryUsage.rss / 1024 / 1024) + 'MB',
          heapUsed: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        }
      }
    };
    
    monitoring.trackAPICall('health_check', startTime, true);
    return healthData;
    
  } catch (error) {
    monitoring.trackAPICall('health_check', startTime, false, error);
    monitoring.reportError(error, { endpoint: '/health' });
    
    return reply.code(500).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Main analysis endpoint
fastify.post('/api/analyze', {
  schema: {
    body: {
      type: 'object',
      required: ['agent', 'files'],
      properties: {
        agent: { type: 'string', minLength: 1, maxLength: 100 },
        files: {
          type: 'array',
          minItems: 1,
          maxItems: 10,
          items: {
            type: 'object',
            required: ['name', 'content', 'type'],
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 255 },
              content: { type: 'string', minLength: 1 },
              type: { type: 'string', enum: ['text', 'binary'] },
              size: { type: 'number', minimum: 1, maximum: 20 * 1024 * 1024 }
            }
          }
        },
        parameters: {
          type: 'object',
          additionalProperties: true
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  
  try {
    // Sanitize all inputs
    const sanitizedBody = sanitizeInput(request.body);
    
    const { agent, files, parameters = {} } = sanitizedBody;
    
    // Add monitoring context
    monitoring.setContext('analysis', {
      agent,
      fileCount: files.length,
      totalFileSize: files.reduce((sum, file) => sum + (file.size || 0), 0)
    });
    
    // Validate file sizes
    const maxFileSize = 20 * 1024 * 1024; // 20MB
    for (const file of files) {
      if (file.size && file.size > maxFileSize) {
        return reply.code(413).send({
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds maximum allowed size (20MB)'
        });
      }
    }

    // Build prompt (simplified version)
    let prompt = `أنت وكيل AI متخصص في تحليل النصوص الدرامية.\n\n`;
    prompt += `المهمة المطلوبة: ${agent}\n\n`;
    
    for (const file of files) {
      if (file.type === 'text') {
        prompt += `\n--- ملف: ${file.name} ---\n`;
        prompt += file.content.substring(0, 10000); // Limit content size
        prompt += '\n';
      }
    }

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return reply.code(500).send({
        code: 'EMPTY_RESPONSE',
        message: 'Empty response from AI service'
      });
    }

    // Return sanitized response
    const sanitizedResponse = sanitizeInput(text);
    
    // Track successful API call
    monitoring.trackAPICall('gemini_analysis', startTime, true);
    
    return {
      ok: true,
      agent,
      raw: sanitizedResponse,
      meta: {
        provider: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        filesProcessed: files.length
      }
    };

  } catch (error) {
    // Track failed API call
    monitoring.trackAPICall('gemini_analysis', startTime, false, error);
    monitoring.reportError(error, { 
      agent: request.body?.agent,
      fileCount: request.body?.files?.length 
    });
    
    fastify.log.error('Analysis error:', error);
    
    let statusCode = 500;
    let errorCode = 'ANALYSIS_FAILED';
    let message = 'فشل في تحليل النص. يرجى المحاولة مرة أخرى.';

    if (error.message?.includes('API key')) {
      statusCode = 500;
      errorCode = 'INVALID_API_KEY';
      message = 'خطأ في إعدادات الخدمة';
    } else if (error.message?.includes('quota')) {
      statusCode = 429;
      errorCode = 'QUOTA_EXCEEDED';
      message = 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 408;
      errorCode = 'REQUEST_TIMEOUT';
      message = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
    }

    return reply.code(statusCode).send({
      code: errorCode,
      message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  // Report error to monitoring
  monitoring.reportError(error, {
    url: request.url,
    method: request.method,
    userAgent: request.headers['user-agent'],
    ip: request.ip
  });
  
  fastify.log.error(error);
  
  if (error.validation) {
    return reply.code(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request format',
      details: error.validation
    });
  }

  return reply.code(500).send({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error'
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
  fastify.log.info(`🚀 Backend server running on http://${host}:${port}`);
  fastify.log.info(`📊 Health check: http://${host}:${port}/health`);
  fastify.log.info(`📚 API Documentation: http://${host}:${port}/docs`);
  fastify.log.info(`📋 OpenAPI Spec: http://${host}:${port}/openapi.yaml`);
  fastify.log.info(`🔒 Rate limit: ${process.env.RATE_LIMIT_MAX || '10'} requests/minute`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully');
  monitoring.reportMessage('Server shutting down (SIGTERM)', 'info');
  await fastify.close();
  monitoring.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully');
  monitoring.reportMessage('Server shutting down (SIGINT)', 'info');
  await fastify.close();
  monitoring.close();
  process.exit(0);
});

start();

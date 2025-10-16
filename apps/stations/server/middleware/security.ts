import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';
import logger from '../utils/logger';

// إعدادات CORS محسنة
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = environment.getSecurityConfig().allowedOrigins;
    
    // السماح بالطلبات بدون origin (مثل Postman، mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// إعدادات Helmet محسنة
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // مطلوب لـ Vite في التطوير
        ...(environment.isDevelopment() ? ["'unsafe-eval'"] : [])
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://generativelanguage.googleapis.com", // Gemini API
        "wss:", // WebSocket connections
        ...(environment.isDevelopment() ? ["ws:", "http://localhost:*"] : [])
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "data:"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"]
    },
    reportOnly: environment.isDevelopment()
  },
  crossOriginEmbedderPolicy: false, // مطلوب لبعض المكتبات
  hsts: environment.isProduction() ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { 
    policy: "strict-origin-when-cross-origin" 
  },
  frameguard: { 
    action: 'deny' 
  },
  hidePoweredBy: true,
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  }
});

// middleware للتحقق من HTTPS في الإنتاج
export const enforceHttps = (req: Request, res: Response, next: NextFunction): void => {
  if (environment.isProduction() && environment.getSecurityConfig().forceHttps) {
    // التحقق من X-Forwarded-Proto header (للخوادم خلف proxy)
    const isHttps = req.secure || 
                   req.headers['x-forwarded-proto'] === 'https' ||
                   req.headers['x-forwarded-ssl'] === 'on';

    if (!isHttps) {
      logger.warn('HTTPS enforcement: redirecting HTTP to HTTPS', {
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
  }
  
  next();
};

// middleware للتحقق من حجم الطلب
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      logger.warn('Request size limit exceeded', {
        contentLength,
        maxSize,
        url: req.url,
        ip: req.ip
      });
      
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds ${maxSize / 1024 / 1024}MB limit`,
        maxSize: maxSize
      });
    }
    
    next();
  };
};

// middleware لحماية من CSRF
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // تطبيق CSRF protection فقط على الطلبات التي تغير البيانات
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] as string;
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      logger.warn('CSRF token validation failed', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        hasToken: !!token,
        hasSessionToken: !!sessionToken
      });
      
      return res.status(403).json({
        error: 'CSRF token mismatch',
        message: 'Invalid or missing CSRF token'
      });
    }
  }
  
  next();
};

// middleware لتسجيل محاولات الأمان المشبوهة
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /on\w+\s*=/i, // Event handler injection
    /eval\s*\(/i, // Code injection
    /document\.cookie/i, // Cookie manipulation
    /window\.location/i, // Location manipulation
  ];

  const userInput = [
    req.url,
    req.query,
    req.body,
    req.headers
  ].flat();

  const inputString = JSON.stringify(userInput).toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(inputString)) {
      logger.warn('Suspicious activity detected', {
        pattern: pattern.toString(),
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        headers: req.headers,
        body: req.body
      });
      
      // في الإنتاج، يمكن إضافة المزيد من الإجراءات مثل حظر IP
      if (environment.isProduction()) {
        // يمكن إضافة منطق حظر IP هنا
        logger.error('Suspicious activity in production', {
          ip: req.ip,
          pattern: pattern.toString()
        });
      }
      
      break;
    }
  }
  
  next();
};

// middleware للتحقق من User-Agent
export const userAgentValidation = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    logger.warn('Request without User-Agent header', {
      url: req.url,
      ip: req.ip
    });
    
    return res.status(400).json({
      error: 'User-Agent header required',
      message: 'Please include a valid User-Agent header'
    });
  }
  
  // رفض User-Agents المشبوهة
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /havij/i,
    /acunetix/i
  ];
  
  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      logger.warn('Suspicious User-Agent detected', {
        userAgent,
        url: req.url,
        ip: req.ip
      });
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'Invalid User-Agent'
      });
    }
  }
  
  next();
};

// middleware للتحقق من معدل الطلبات المتقدم
export const advancedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  // هذا مثال بسيط - في الإنتاج يجب استخدام Redis
  if (!req.app.locals.rateLimitStore) {
    req.app.locals.rateLimitStore = new Map();
  }
  
  const store = req.app.locals.rateLimitStore;
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  
  const current = store.get(key) || 0;
  
  if (current >= maxRequests) {
    logger.warn('Rate limit exceeded', {
      ip,
      current,
      maxRequests,
      url: req.url
    });
    
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  
  store.set(key, current + 1);
  
  // تنظيف البيانات القديمة
  if (store.size > 1000) {
    const cutoff = Math.floor((now - windowMs) / windowMs);
    for (const [k] of store) {
      const timestamp = parseInt(k.split(':')[1]);
      if (timestamp < cutoff) {
        store.delete(k);
      }
    }
  }
  
  next();
};

// دالة لتطبيق جميع middleware الأمان
export const applySecurityMiddleware = (app: any): void => {
  // تطبيق CORS
  app.use(cors(corsOptions));
  
  // تطبيق Helmet
  app.use(securityHeaders);
  
  // تطبيق HTTPS enforcement
  app.use(enforceHttps);
  
  // تطبيق request size limit
  app.use(requestSizeLimit(10 * 1024 * 1024)); // 10MB
  
  // تطبيق security logging
  app.use(securityLogger);
  
  // تطبيق User-Agent validation
  app.use(userAgentValidation);
  
  // تطبيق advanced rate limiting
  app.use(advancedRateLimit);
  
  logger.info('Security middleware applied successfully');
};


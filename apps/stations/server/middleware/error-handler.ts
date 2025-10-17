import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { environment } from '../config/environment';
import logger from '../utils/logger';

// أنواع الأخطاء المخصصة
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true,
    code?: string,
    details?: unknown
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    // الحفاظ على stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(`External service error: ${service} - ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(`Database error: ${message}`, 500, true, 'DATABASE_ERROR', details);
  }
}

// معالج الأخطاء الرئيسي
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void _next;
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details: unknown = undefined;

  // معالجة أنواع الأخطاء المختلفة
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = {
      issues: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    code = 'INVALID_FORMAT';
  } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database error';
    code = 'DATABASE_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    code = 'FILE_UPLOAD_ERROR';
  }

  // تسجيل الخطأ
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code,
      statusCode
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params
    },
    timestamp: new Date().toISOString()
  };

  // تسجيل مختلف حسب مستوى الخطأ
  if (statusCode >= 500) {
    logger.error('Server error occurred', logData);
  } else if (statusCode >= 400) {
    logger.warn('Client error occurred', logData);
  } else {
    logger.info('Error occurred', logData);
  }

  // إرسال الاستجابة
  const response: Record<string, unknown> = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // إضافة التفاصيل في وضع التطوير أو للأخطاء التشغيلية
  if (environment.isDevelopment() || (error instanceof AppError && error.isOperational)) {
    response.details = details;
    if (environment.isDevelopment()) {
      response.stack = error.stack;
    }
  }

  // إضافة معلومات إضافية للأخطاء المحددة
  if (error instanceof RateLimitError) {
    response.retryAfter = 900; // 15 minutes
  }

  res.status(statusCode).json(response);
};

// معالج للطلبات غير المعروفة
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
  next(error);
};

// معالج للطلبات غير المدعومة
export const methodNotAllowedHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Method ${req.method} not allowed for ${req.url}`,
    405,
    true,
    'METHOD_NOT_ALLOWED'
  );
  next(error);
};

// معالج للطلبات المتوقفة
export const gracefulShutdownHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.GRACEFUL_SHUTDOWN === 'true') {
    const error = new AppError(
      'Server is shutting down',
      503,
      true,
      'SERVICE_UNAVAILABLE'
    );
    next(error);
  } else {
    next();
  }
};

// معالج للتحقق من صحة البيانات
export const validateRequest = (schema: unknown) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new ValidationError('Invalid request data', error));
      }
    }
  };
};

// معالج للتحقق من وجود البيانات المطلوبة
export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      const error = new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
      next(error);
    } else {
      next();
    }
  };
};

// معالج للتحقق من صحة الملفات
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file;
    
    if (options.required && !file) {
      const error = new ValidationError('File is required');
      next(error);
      return;
    }

    if (file) {
      // التحقق من حجم الملف
      if (options.maxSize && file.size > options.maxSize) {
        const error = new ValidationError(
          `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`
        );
        next(error);
        return;
      }

      // التحقق من نوع الملف
      if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
        const error = new ValidationError(
          `File type ${file.mimetype} not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
        );
        next(error);
        return;
      }
    }

    next();
  };
};

// دالة لإنشاء خطأ مخصص
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): AppError => {
  return new AppError(message, statusCode, true, code, details);
};

// دالة للتحقق من وجود خطأ
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// معالج للخطأ غير المتوقع
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // إغلاق التطبيق بأمان
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
  
  // إغلاق التطبيق بأمان
  process.exit(1);
});

// معالج لإشارات النظام
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const setupMiddleware = (app: express.Application): void => {
  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', limiter);

  // Request logging
  app.use((req, res, next) => {
    logger.info('Request received', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    next();
  });

  // Error handling middleware
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', error);
    
    res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي في الخادم',
    });
  });
};
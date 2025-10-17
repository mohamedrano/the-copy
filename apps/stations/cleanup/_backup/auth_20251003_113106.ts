import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  userId?: string;
}

export function apiKeyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide an API key in X-API-Key header'
    });
    return;
  }

  const validApiKeys = (process.env.VALID_API_KEYS || '').split(',').filter(Boolean);

  if (validApiKeys.length === 0) {
    logger.warn('⚠️ No API keys configured. Authentication is disabled.', {
      context: 'apiKeyAuth'
    });
    req.apiKey = apiKey;
    next();
    return;
  }

  if (!validApiKeys.includes(apiKey)) {
    res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
    return;
  }

  req.apiKey = apiKey;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey) {
    const validApiKeys = (process.env.VALID_API_KEYS || '').split(',').filter(Boolean);
    if (validApiKeys.includes(apiKey)) {
      req.apiKey = apiKey;
    }
  }

  next();
}

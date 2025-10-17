import { Request, Response, NextFunction } from 'express';

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        obj[key] = value.replace(/\0/g, '');

        const sanitizedValue = obj[key];
        if (typeof sanitizedValue === 'string' && sanitizedValue.length > 500000) {
          obj[key] = sanitizedValue.substring(0, 500000);
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitizeObject(value as Record<string, unknown>);
      }
    }
  }
}

export function requireJsonContent(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.includes('application/json')) {
    res.status(415).json({
      error: 'Unsupported Media Type',
      message: 'Content-Type must be application/json'
    });
    return;
  }

  next();
}

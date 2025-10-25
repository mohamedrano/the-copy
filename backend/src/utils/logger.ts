import winston from 'winston';
import { env, isDevelopment } from '@/config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'the-copy-backend' },
  transports: [
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : logFormat,
    }),
  ],
});

if (!isDevelopment) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}
import { z } from 'zod';
import logger from '../utils/logger';

// مخطط التحقق من متغيرات البيئة
const environmentSchema = z.object({
  // إعدادات التطبيق الأساسية
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  API_BASE_URL: z.string().url().default('http://localhost:5000'),

  // إعدادات قاعدة البيانات
  DATABASE_URL: z.string().optional().default('postgresql://localhost:5432/stations_dev'),

  // إعدادات Gemini AI (اختياري - fail-open mode)
  GEMINI_API_KEY: z.string().optional().default(''),

  // إعدادات الأمان
  VALID_API_KEYS: z.string().transform((val) => val.split(',').filter(Boolean)).default('dev-key-12345'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').default('development-secret-key-minimum-32-characters-required-here'),
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',').filter(Boolean)).default('http://localhost:5173,http://localhost:5000'),

  // إعدادات Redis (اختياري)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // إعدادات المراقبة والتسجيل
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().url().optional(),

  // إعدادات Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  AI_ANALYSIS_RATE_LIMIT_MAX: z.string().transform(Number).default('10'),
  AI_ANALYSIS_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('3600000'),

  // إعدادات التخزين المؤقت
  CACHE_TTL_SECONDS: z.string().transform(Number).default('3600'),
  ENABLE_CACHE: z.string().transform((val) => val === 'true').default('false'),

  // إعدادات قاعدة البيانات المتقدمة
  DB_POOL_MIN: z.string().transform(Number).default('2'),
  DB_POOL_MAX: z.string().transform(Number).default('10'),
  DB_POOL_IDLE_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  DB_POOL_ACQUIRE_TIMEOUT_MS: z.string().transform(Number).default('60000'),

  // إعدادات الأمان المتقدمة
  JWT_EXPIRES_IN: z.string().transform(Number).default('86400'),
  SESSION_MAX_AGE: z.string().transform(Number).default('86400000'),
  FORCE_HTTPS: z.string().transform((val) => val === 'true').default('false'),

  // إعدادات التطوير
  DEBUG: z.string().transform((val) => val === 'true').default('false'),
  VERBOSE_LOGGING: z.string().transform((val) => val === 'true').default('false'),

  // إعدادات الإنتاج
  ENABLE_COMPRESSION: z.string().transform((val) => val === 'true').default('true'),
  ENABLE_PERFORMANCE_OPTIMIZATIONS: z.string().transform((val) => val === 'true').default('true'),

  // إعدادات النسخ الاحتياطي
  BACKUP_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  BACKUP_SCHEDULE: z.string().default('0 2 * * *'),
  BACKUP_RETENTION_DAYS: z.string().transform(Number).default('30'),
});

export type EnvironmentConfig = z.infer<typeof environmentSchema>;

class EnvironmentManager {
  private config: EnvironmentConfig;
  private isInitialized = false;

  constructor() {
    this.config = this.loadEnvironment();
  }

  private loadEnvironment(): EnvironmentConfig {
    try {
      const config = environmentSchema.parse(process.env);
      this.isInitialized = true;
      
      logger.info('Environment configuration loaded successfully', {
        nodeEnv: config.NODE_ENV,
        port: config.PORT,
        apiBaseUrl: config.API_BASE_URL,
        cacheEnabled: config.ENABLE_CACHE,
        debugMode: config.DEBUG
      });

      return config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.errors
          .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
          .map(err => err.path.join('.'));

        const invalidVars = error.errors
          .filter(err => err.code !== 'invalid_type')
          .map(err => `${err.path.join('.')}: ${err.message}`);

        logger.error('Environment configuration validation failed', {
          missingVariables: missingVars,
          invalidVariables: invalidVars,
          totalErrors: error.errors.length
        });

        throw new Error(
          `Environment configuration failed:\n` +
          `Missing variables: ${missingVars.join(', ')}\n` +
          `Invalid variables: ${invalidVars.join(', ')}`
        );
      }

      logger.error('Failed to load environment configuration', { error });
      throw error;
    }
  }

  public getConfig(): EnvironmentConfig {
    if (!this.isInitialized) {
      throw new Error('Environment not initialized');
    }
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public getDatabaseConfig() {
    return {
      url: this.config.DATABASE_URL,
      pool: {
        min: this.config.DB_POOL_MIN,
        max: this.config.DB_POOL_MAX,
        idleTimeoutMillis: this.config.DB_POOL_IDLE_TIMEOUT_MS,
        acquireTimeoutMillis: this.config.DB_POOL_ACQUIRE_TIMEOUT_MS,
      }
    };
  }

  public getRedisConfig() {
    return {
      host: this.config.REDIS_HOST,
      port: this.config.REDIS_PORT,
      password: this.config.REDIS_PASSWORD,
      url: this.config.REDIS_URL,
    };
  }

  public getSecurityConfig() {
    return {
      validApiKeys: this.config.VALID_API_KEYS,
      sessionSecret: this.config.SESSION_SECRET,
      allowedOrigins: this.config.ALLOWED_ORIGINS,
      jwtExpiresIn: this.config.JWT_EXPIRES_IN,
      sessionMaxAge: this.config.SESSION_MAX_AGE,
      forceHttps: this.config.FORCE_HTTPS,
    };
  }

  public getRateLimitConfig() {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
      maxRequests: this.config.RATE_LIMIT_MAX_REQUESTS,
      aiAnalysisMax: this.config.AI_ANALYSIS_RATE_LIMIT_MAX,
      aiAnalysisWindowMs: this.config.AI_ANALYSIS_RATE_LIMIT_WINDOW_MS,
    };
  }

  public getCacheConfig() {
    return {
      ttlSeconds: this.config.CACHE_TTL_SECONDS,
      enabled: this.config.ENABLE_CACHE,
    };
  }

  public getLoggingConfig() {
    return {
      level: this.config.LOG_LEVEL,
      verbose: this.config.VERBOSE_LOGGING,
      debug: this.config.DEBUG,
    };
  }

  public getPerformanceConfig() {
    return {
      enableCompression: this.config.ENABLE_COMPRESSION,
      enableOptimizations: this.config.ENABLE_PERFORMANCE_OPTIMIZATIONS,
    };
  }

  public getBackupConfig() {
    return {
      enabled: this.config.BACKUP_ENABLED,
      schedule: this.config.BACKUP_SCHEDULE,
      retentionDays: this.config.BACKUP_RETENTION_DAYS,
    };
  }

  // دالة للتحقق من صحة الإعدادات في وقت التشغيل
  public validateRuntimeConfig(): void {
    const config = this.getConfig();

    // التحقق من قوة SESSION_SECRET
    if (config.SESSION_SECRET.length < 32) {
      logger.warn('SESSION_SECRET is too short, consider using a longer secret');
    }

    // التحقق من وجود مفاتيح API صالحة
    if (config.VALID_API_KEYS.length === 0) {
      logger.warn('No API keys configured, authentication is disabled');
    }

    // التحقق من إعدادات قاعدة البيانات
    if (!config.DATABASE_URL.includes('://')) {
      logger.error('Invalid DATABASE_URL format');
      throw new Error('Invalid DATABASE_URL format');
    }

    // التحقق من إعدادات Redis في الإنتاج
    if (config.NODE_ENV === 'production' && config.ENABLE_CACHE && !config.REDIS_URL) {
      logger.warn('Cache is enabled but REDIS_URL is not configured');
    }

    logger.info('Runtime configuration validation completed');
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const environment = new EnvironmentManager();

// تصدير الدوال المساعدة
export const getConfig = () => environment.getConfig();
export const isDevelopment = () => environment.isDevelopment();
export const isProduction = () => environment.isProduction();
export const isTest = () => environment.isTest();

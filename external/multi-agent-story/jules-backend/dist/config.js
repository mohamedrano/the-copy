import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
export const config = {
    // Application
    appName: process.env.APP_NAME || 'Jules',
    appVersion: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    // Server
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '8000', 10),
    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/jules_db',
    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    // Security
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-fernet-encryption-key-44-chars',
    accessTokenExpireMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '30', 10),
    refreshTokenExpireDays: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7', 10),
    // CORS
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    // Rate Limiting
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
    rateLimitPerHour: parseInt(process.env.RATE_LIMIT_PER_HOUR || '1000', 10),
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    // Gemini API (for testing only - should be provided by user)
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    // Sentry
    sentryDsn: process.env.SENTRY_DSN || '',
    // Feature Flags
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableSentry: process.env.ENABLE_SENTRY === 'true',
    // Agent Configuration
    agents: {
        defaultModel: 'gemini-2.0-flash-exp',
        defaultTemperature: 0.7,
        defaultMaxTokens: 40000,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000
    },
    // Session Configuration
    session: {
        maxConcurrentSessions: 10,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        cleanupInterval: 60 * 60 * 1000 // 1 hour
    }
};
// Validate required environment variables
export function validateConfig() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    // Validate JWT secret length (minimum 32 characters)
    if (config.jwtSecret.length < 32) {
        console.warn('⚠️  JWT_SECRET should be at least 32 characters long for production');
    }
}
// Export config as default
export default config;
//# sourceMappingURL=config.js.map
export declare const config: {
    appName: string;
    appVersion: string;
    environment: string;
    host: string;
    port: number;
    databaseUrl: string;
    redisUrl: string;
    jwtSecret: string;
    encryptionKey: string;
    accessTokenExpireMinutes: number;
    refreshTokenExpireDays: number;
    corsOrigins: string[];
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    logLevel: string;
    geminiApiKey: string;
    sentryDsn: string;
    enableAnalytics: boolean;
    enableSentry: boolean;
    agents: {
        defaultModel: string;
        defaultTemperature: number;
        defaultMaxTokens: number;
        maxRetries: number;
        retryDelay: number;
        timeout: number;
    };
    session: {
        maxConcurrentSessions: number;
        sessionTimeout: number;
        cleanupInterval: number;
    };
};
export declare function validateConfig(): void;
export default config;
//# sourceMappingURL=config.d.ts.map
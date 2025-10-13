import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { config, validateConfig } from './config';
import { logger } from './utils/logger';
import jwt from '@fastify/jwt';
// Initialize Prisma
export const prisma = new PrismaClient({
    log: config.environment === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});
// Create Fastify app
export const app = Fastify({
    logger: config.environment === 'development' ? {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    } : true
});
// Register JWT plugin
app.register(jwt, {
    secret: config.jwtSecret
});
// Add Prisma to app instance
app.decorate('prisma', prisma);
// Validate configuration
try {
    validateConfig();
    logger.info('Configuration validated successfully');
}
catch (error) {
    logger.error('Configuration validation failed', { error });
    process.exit(1);
}
// Health check endpoint
app.get('/health', async (request, reply) => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.environment,
        version: config.appVersion,
        database: 'connected'
    };
});
// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
        await app.close();
        await prisma.$disconnect();
        logger.info('Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        logger.error('Error during graceful shutdown', { error });
        process.exit(1);
    }
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
export default app;
//# sourceMappingURL=app.js.map
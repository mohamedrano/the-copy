import Fastify from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
// Services
import { SessionService } from './services/session.service';
import { ApiKeyService } from './services/api-key.service';
import { AgentService } from './services/agent.service';
import { IdeaService } from './services/idea.service';
import { ReviewService } from './services/review.service';
import { TournamentService } from './services/tournament.service';
import { DecisionService } from './services/decision.service';
import { OrchestratorService } from './services/orchestrator.service';
// WebSocket
import { ConnectionManager } from './api/websocket/connection-manager';
import { WebSocketEventHandlers } from './api/websocket/event-handlers';
// Gemini Integration
import { GeminiPool } from './integrations/gemini/pool';
// Utils
import { logger } from './utils/logger';
import { config } from './config';
export class JulesServer {
    fastify;
    io;
    prisma;
    geminiPool;
    // Services
    sessionService;
    apiKeyService;
    agentService;
    ideaService;
    reviewService;
    tournamentService;
    decisionService;
    orchestratorService;
    // WebSocket
    connectionManager;
    eventHandlers;
    constructor() {
        this.fastify = Fastify({
            logger: {
                level: config.logLevel,
                transport: config.environment === 'development' ? {
                    target: 'pino-pretty'
                } : undefined
            }
        });
        this.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error']
        });
        this.geminiPool = new GeminiPool({
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7,
            maxTokens: 40000,
            topP: 0.8,
            topK: 40,
            retryAttempts: 3,
            retryDelay: 1000,
            timeout: 30000
        });
        this.initializeServices();
        this.initializeWebSocket();
    }
    initializeServices() {
        // Initialize services
        this.agentService = new AgentService(this.prisma, this.geminiPool);
        this.sessionService = new SessionService(this.prisma);
        this.apiKeyService = new ApiKeyService(this.prisma);
        this.ideaService = new IdeaService(this.prisma, this.agentService);
        this.reviewService = new ReviewService(this.prisma, this.agentService);
        this.tournamentService = new TournamentService(this.prisma, this.agentService);
        this.decisionService = new DecisionService(this.prisma, this.agentService);
        this.orchestratorService = new OrchestratorService(this.prisma, this.agentService, this.ideaService, this.reviewService, this.tournamentService, this.decisionService);
        logger.info('Services initialized successfully');
    }
    initializeWebSocket() {
        const httpServer = createServer();
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: config.corsOrigins,
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.connectionManager = new ConnectionManager(this.io);
        this.eventHandlers = new WebSocketEventHandlers(this.connectionManager, this.orchestratorService);
        logger.info('WebSocket initialized successfully');
    }
    async registerPlugins() {
        // CORS
        await this.fastify.register(cors, {
            origin: config.corsOrigins,
            credentials: true
        });
        // Rate limiting
        await this.fastify.register(rateLimit, {
            max: config.rateLimitPerMinute,
            timeWindow: '1 minute'
        });
        // JWT
        await this.fastify.register(jwt, {
            secret: config.jwtSecret
        });
        logger.info('Plugins registered successfully');
    }
    async registerRoutes() {
        // Health check
        this.fastify.get('/health', async (request, reply) => {
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: config.environment,
                version: config.appVersion
            };
        });
        // Register API routes
        const { authRoutes } = await import('./api/routes/auth.routes');
        await this.fastify.register(authRoutes, {
            prefix: '/api/v1/auth',
            apiKeyService: this.apiKeyService
        });
        logger.info('Routes registered successfully');
    }
    async registerHooks() {
        // Authentication hook
        this.fastify.addHook('preHandler', async (request, reply) => {
            // Skip authentication for certain routes
            const publicRoutes = ['/health', '/api/v1/auth/login', '/api/v1/auth/register'];
            if (publicRoutes.includes(request.url)) {
                return;
            }
            try {
                await request.jwtVerify();
                request.user = request.user;
            }
            catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        });
        logger.info('Hooks registered successfully');
    }
    async start() {
        try {
            // Connect to database
            await this.prisma.$connect();
            logger.info('Database connected successfully');
            // Register plugins, routes, and hooks
            await this.registerPlugins();
            await this.registerRoutes();
            await this.registerHooks();
            // Start server
            const port = config.port;
            const host = config.host;
            await this.fastify.listen({ port, host });
            logger.info(`🚀 Jules Server started successfully!`);
            logger.info(`📡 Server running on http://${host}:${port}`);
            logger.info(`📊 Environment: ${config.environment}`);
            logger.info(`🔧 Version: ${config.appVersion}`);
        }
        catch (error) {
            logger.error('Failed to start server', { error });
            process.exit(1);
        }
    }
    async stop() {
        try {
            logger.info('Stopping Jules Server...');
            // Stop Fastify
            await this.fastify.close();
            // Stop WebSocket
            this.io.close();
            // Disconnect from database
            await this.prisma.$disconnect();
            // Cleanup services
            this.connectionManager.cleanup();
            logger.info('Jules Server stopped successfully');
        }
        catch (error) {
            logger.error('Error stopping server', { error });
        }
    }
    // Graceful shutdown
    setupGracefulShutdown() {
        const signals = ['SIGINT', 'SIGTERM'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                logger.info(`Received ${signal}, shutting down gracefully...`);
                await this.stop();
                process.exit(0);
            });
        });
    }
}
// Start server if this file is run directly
if (require.main === module) {
    const server = new JulesServer();
    server.setupGracefulShutdown();
    server.start().catch(error => {
        logger.error('Failed to start server', { error });
        process.exit(1);
    });
}
export default JulesServer;
//# sourceMappingURL=server.js.map
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Routes
import { authRoutes } from './routes/auth';
import { sessionRoutes } from './routes/sessions';
import { agentRoutes } from './routes/agents';
import { wsHandler } from './ws/handler';

// Environment validation
import { validateEnv } from './config/env';

// Start workers (only in production or when explicitly requested)
if (process.env.NODE_ENV === 'production' || process.env.START_WORKERS === 'true') {
  import('./services/workers');
}

// Validate environment variables first
const env = validateEnv();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redis = new Redis(env.REDIS_URL);

// Create Fastify instance
const server = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
});

// Register plugins
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
});

server.register(cors, {
  origin: env.CORS_ORIGINS.split(',').map(origin => origin.trim()),
  credentials: true
});

server.register(jwt, {
  secret: env.JWT_SECRET
});

server.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_TIME_WINDOW
});

server.register(websocket);

// Decorators
server.decorate('prisma', prisma);
server.decorate('redis', redis);

// Authentication hook
server.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Health check
server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Cloud Run healthcheck endpoint
server.get('/healthz', async (request, reply) => {
  reply.code(200).send('ok');
});

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(sessionRoutes, { prefix: '/api/sessions' });
server.register(agentRoutes, { prefix: '/api/agents' });

// WebSocket handler
server.register(async function (fastify) {
  fastify.get('/ws/:sessionId', { websocket: true }, wsHandler);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  server.log.info('Starting graceful shutdown...');
  
  try {
    await server.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  } catch (err) {
    server.log.error(err, 'Error during graceful shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: env.HOST });
    
    server.log.info(`Jules Backend running on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

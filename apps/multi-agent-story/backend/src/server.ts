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

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create Fastify instance
const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
});

// Register plugins
server.register(helmet, {
  contentSecurityPolicy: false
});

server.register(cors, {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5181'],
  credentials: true
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key'
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
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
    const port = parseInt(process.env.PORT || '8000');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    server.log.info(`Jules Backend running on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

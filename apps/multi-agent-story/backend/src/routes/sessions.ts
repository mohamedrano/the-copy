import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { agentManager } from '../agents/config';
import { QueueService } from '../services/queue';

const createSessionSchema = z.object({
  brief: z.string().min(10),
});

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  const { prisma, redis } = fastify as any;

  // Create session
  fastify.post('/', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    try {
      const { brief } = createSessionSchema.parse(request.body);
      
      // Create session
      const session = await prisma.session.create({
        data: {
          brief,
          userId: request.user.id,
          status: 'ACTIVE',
          phase: 1,
        },
        include: {
          agents: true,
          ideas: true,
        },
      });

      // Initialize agents for session
      const agents = await prisma.agent.findMany();
      
      for (const agent of agents) {
        await prisma.agentSession.create({
          data: {
            sessionId: session.id,
            agentId: agent.id,
            status: 'IDLE',
          },
        });
      }

      // Store in Redis for quick access
      await redis.set(`session:${session.id}`, JSON.stringify(session), 'EX', 86400);

      // Start first phase using queue system
      await QueueService.schedulePhaseStart(session.id, 1, 1000);

      return reply.send(session);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get session
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;

    // Check Redis first
    const cached = await redis.get(`session:${id}`);
    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        agents: {
          include: {
            agent: true,
          },
        },
        ideas: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
      },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    // Check ownership
    if (session.userId !== request.user.id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    // Cache it
    await redis.set(`session:${id}`, JSON.stringify(session), 'EX', 3600);

    return reply.send(session);
  });

  // List sessions
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const sessions = await prisma.session.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        ideas: {
          where: { isWinner: true },
        },
      },
    });

    return reply.send(sessions);
  });

  // Update session
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { status, phase } = request.body;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    if (session.userId !== request.user.id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        status,
        phase,
        ...(status === 'COMPLETED' ? { endTime: new Date() } : {}),
      },
    });

    // Clear cache
    await redis.del(`session:${id}`);

    return reply.send(updated);
  });

  // Delete session
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    if (session.userId !== request.user.id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    // Cancel any pending queue jobs for this session
    await QueueService.cancelSessionJobs(id);

    // Delete related data
    await prisma.message.deleteMany({ where: { sessionId: id } });
    await prisma.agentSession.deleteMany({ where: { sessionId: id } });
    await prisma.idea.deleteMany({ where: { sessionId: id } });
    await prisma.session.delete({ where: { id } });

    // Clear cache
    await redis.del(`session:${id}`);

    return reply.send({ success: true });
  });

  // Get session ideas
  fastify.get('/:id/ideas', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;

    const ideas = await prisma.idea.findMany({
      where: { sessionId: id },
      orderBy: { score: 'desc' },
    });

    return reply.send(ideas);
  });

  // Select winner idea
  fastify.post('/:sessionId/ideas/:ideaId/win', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { sessionId, ideaId } = request.params;

    // Update all ideas to not winner
    await prisma.idea.updateMany({
      where: { sessionId },
      data: { isWinner: false },
    });

    // Set winner
    const winner = await prisma.idea.update({
      where: { id: ideaId },
      data: { isWinner: true },
    });

    // Update session status
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
      },
    });

    return reply.send(winner);
  });

  // Get session job status
  fastify.get('/:id/jobs', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    if (session.userId !== request.user.id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const jobStatus = await QueueService.getSessionJobStatus(id);
    return reply.send(jobStatus);
  });
};

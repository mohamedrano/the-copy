import { FastifyPluginAsync } from 'fastify';
import { AGENTS, agentManager } from '../agents/config';

export const agentRoutes: FastifyPluginAsync = async (fastify) => {
  const { prisma } = fastify as any;

  // Get all agents
  fastify.get('/', async (request, reply) => {
    const agents = await prisma.agent.findMany();
    
    if (agents.length === 0) {
      // Seed agents if not exists
      for (const agentConfig of AGENTS) {
        await prisma.agent.create({
          data: {
            id: agentConfig.id,
            name: agentConfig.name,
            nameAr: agentConfig.nameAr,
            role: agentConfig.role,
            roleAr: agentConfig.roleAr,
            description: agentConfig.description,
            capabilities: agentConfig.capabilities,
            prompt: agentConfig.systemPrompt,
          },
        });
      }
      
      const seededAgents = await prisma.agent.findMany();
      return reply.send(seededAgents);
    }
    
    return reply.send(agents);
  });

  // Get agent by ID
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;
    
    const agent = await prisma.agent.findUnique({
      where: { id },
    });
    
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }
    
    return reply.send(agent);
  });

  // Get agent status for a session
  fastify.get('/:id/status', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { sessionId } = request.query;
    
    if (!sessionId) {
      return reply.status(400).send({ error: 'Session ID required' });
    }
    
    const agentSession = await prisma.agentSession.findUnique({
      where: {
        sessionId_agentId: {
          sessionId,
          agentId: id,
        },
      },
      include: {
        agent: true,
      },
    });
    
    if (!agentSession) {
      return reply.status(404).send({ error: 'Agent session not found' });
    }
    
    return reply.send(agentSession);
  });

  // Execute agent manually (for testing)
  fastify.post('/:id/execute', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { sessionId, prompt, context } = request.body;
    
    if (!sessionId || !prompt) {
      return reply.status(400).send({ error: 'Session ID and prompt required' });
    }
    
    // Check session ownership
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    
    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }
    
    if (session.userId !== request.user.id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    // Update agent status
    await prisma.agentSession.updateMany({
      where: {
        sessionId,
        agentId: id,
      },
      data: {
        status: 'WORKING',
      },
    });
    
    try {
      // Execute agent
      const result = await agentManager.executeAgent(id, prompt, context || session);
      
      // Store message
      await prisma.message.create({
        data: {
          sessionId,
          agentId: id,
          type: 'AGENT',
          content: result,
          metadata: { prompt, context },
        },
      });
      
      // Update agent status
      await prisma.agentSession.updateMany({
        where: {
          sessionId,
          agentId: id,
        },
        data: {
          status: 'COMPLETED',
          lastAction: result.substring(0, 200),
        },
      });
      
      return reply.send({ result });
    } catch (error: any) {
      // Update agent status to error
      await prisma.agentSession.updateMany({
        where: {
          sessionId,
          agentId: id,
        },
        data: {
          status: 'ERROR',
          lastAction: error.message,
        },
      });
      
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message });
    }
  });

  // Get agent messages for a session
  fastify.get('/:id/messages', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { sessionId } = request.query;
    
    if (!sessionId) {
      return reply.status(400).send({ error: 'Session ID required' });
    }
    
    const messages = await prisma.message.findMany({
      where: {
        sessionId,
        agentId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    
    return reply.send(messages);
  });
};

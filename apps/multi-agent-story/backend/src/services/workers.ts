import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { agentManager } from '../agents/config';
import { StartPhaseJob, AgentExecutionJob } from './queue';

// Redis connection for workers
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize Prisma
const prisma = new PrismaClient();

// Session worker for phase management
export const sessionWorker = new Worker(
  'session-tasks',
  async (job: Job<StartPhaseJob>) => {
    const { sessionId, phase } = job.data;
    
    try {
      // Get session data
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          ideas: true,
        },
      });

      if (!session || session.status !== 'ACTIVE') {
        throw new Error(`Session ${sessionId} not found or not active`);
      }

      // Update phase
      await prisma.session.update({
        where: { id: sessionId },
        data: { phase },
      });

      // Execute agents for this phase
      const results = await agentManager.runPhase(phase, session);

      // Store results
      for (const result of results) {
        await prisma.message.create({
          data: {
            sessionId,
            agentId: result.agentId,
            type: 'AGENT',
            content: result.result,
          },
        });

        // Update agent status
        await prisma.agentSession.updateMany({
          where: {
            sessionId,
            agentId: result.agentId,
          },
          data: {
            status: 'COMPLETED',
            lastAction: result.result.substring(0, 200),
          },
        });
      }

      // Move to next phase if not final
      if (phase < 5 && session.status === 'ACTIVE') {
        const { sessionQueue } = await import('./queue');
        await sessionQueue.add(
          'start-phase',
          { sessionId, phase: phase + 1 },
          {
            delay: 5000, // 5 second delay between phases
            jobId: `start-phase-${sessionId}-${phase + 1}`,
          }
        );
      }

      console.log(`Phase ${phase} completed for session ${sessionId}`);
    } catch (error) {
      console.error(`Error processing phase ${phase} for session ${sessionId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 sessions concurrently
  }
);

// Agent worker for individual agent tasks
export const agentWorker = new Worker(
  'agent-tasks',
  async (job: Job<AgentExecutionJob>) => {
    const { sessionId, agentId, phase, data } = job.data;
    
    try {
      // Get session and agent data
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          ideas: true,
        },
      });

      if (!session || session.status !== 'ACTIVE') {
        throw new Error(`Session ${sessionId} not found or not active`);
      }

      // Execute agent
      const result = await agentManager.executeAgent(agentId, session, data);

      // Store result
      await prisma.message.create({
        data: {
          sessionId,
          agentId,
          type: 'AGENT',
          content: result,
        },
      });

      // Update agent status
      await prisma.agentSession.updateMany({
        where: {
          sessionId,
          agentId,
        },
        data: {
          status: 'COMPLETED',
          lastAction: result.substring(0, 200),
        },
      });

      console.log(`Agent ${agentId} completed task for session ${sessionId}`);
    } catch (error) {
      console.error(`Error executing agent ${agentId} for session ${sessionId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process up to 10 agent tasks concurrently
  }
);

// Error handling
sessionWorker.on('failed', (job, err) => {
  console.error(`Session job ${job?.id} failed:`, err);
});

agentWorker.on('failed', (job, err) => {
  console.error(`Agent job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await sessionWorker.close();
  await agentWorker.close();
  await prisma.$disconnect();
  redisConnection.disconnect();
});

process.on('SIGINT', async () => {
  await sessionWorker.close();
  await agentWorker.close();
  await prisma.$disconnect();
  redisConnection.disconnect();
});

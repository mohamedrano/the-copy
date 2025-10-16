import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// Redis connection for BullMQ
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Queue for session tasks
export const sessionQueue = new Queue('session-tasks', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Queue for agent tasks
export const agentQueue = new Queue('agent-tasks', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job types
export interface StartPhaseJob {
  sessionId: string;
  phase: number;
}

export interface AgentExecutionJob {
  sessionId: string;
  agentId: string;
  phase: number;
  data: any;
}

// Queue service class
export class QueueService {
  static async schedulePhaseStart(sessionId: string, phase: number, delay: number = 1000) {
    await sessionQueue.add(
      'start-phase',
      { sessionId, phase } as StartPhaseJob,
      {
        delay,
        jobId: `start-phase-${sessionId}-${phase}`,
      }
    );
  }

  static async scheduleAgentExecution(
    sessionId: string,
    agentId: string,
    phase: number,
    data: any,
    delay: number = 0
  ) {
    await agentQueue.add(
      'execute-agent',
      { sessionId, agentId, phase, data } as AgentExecutionJob,
      {
        delay,
        jobId: `agent-${agentId}-${sessionId}-${phase}`,
      }
    );
  }

  static async cancelSessionJobs(sessionId: string) {
    // Cancel all pending jobs for this session
    const sessionJobs = await sessionQueue.getJobs(['waiting', 'delayed']);
    const agentJobs = await agentQueue.getJobs(['waiting', 'delayed']);

    const sessionJobPromises = sessionJobs
      .filter(job => job.data.sessionId === sessionId)
      .map(job => job.remove());

    const agentJobPromises = agentJobs
      .filter(job => job.data.sessionId === sessionId)
      .map(job => job.remove());

    await Promise.all([...sessionJobPromises, ...agentJobPromises]);
  }

  static async getSessionJobStatus(sessionId: string) {
    const sessionJobs = await sessionQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const agentJobs = await agentQueue.getJobs(['waiting', 'active', 'completed', 'failed']);

    const relevantJobs = [
      ...sessionJobs.filter(job => job.data.sessionId === sessionId),
      ...agentJobs.filter(job => job.data.sessionId === sessionId),
    ];

    return {
      waiting: relevantJobs.filter(job => job.state === 'waiting').length,
      active: relevantJobs.filter(job => job.state === 'active').length,
      completed: relevantJobs.filter(job => job.state === 'completed').length,
      failed: relevantJobs.filter(job => job.state === 'failed').length,
    };
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await sessionQueue.close();
  await agentQueue.close();
  redisConnection.disconnect();
});

process.on('SIGINT', async () => {
  await sessionQueue.close();
  await agentQueue.close();
  redisConnection.disconnect();
});

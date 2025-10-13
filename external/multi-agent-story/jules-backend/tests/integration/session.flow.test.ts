import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { SessionService } from '../../src/services/session.service'
import { AgentService } from '../../src/services/agent.service'
import { OrchestratorService } from '../../src/services/orchestrator.service'
import { IdeaService } from '../../src/services/idea.service'
import { ReviewService } from '../../src/services/review.service'
import { TournamentService } from '../../src/services/tournament.service'
import { DecisionService } from '../../src/services/decision.service'
import { GeminiPool } from '../../src/integrations/gemini/pool'

describe('Complete Session Flow Integration Test', () => {
  let prisma: PrismaClient
  let sessionService: SessionService
  let orchestratorService: OrchestratorService
  let testUserId: string
  let testApiKey: string

  beforeAll(async () => {
    prisma = new PrismaClient()
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        hashedPassword: 'hashed-password',
        name: 'Test User'
      }
    })
    testUserId = user.id

    // Initialize services
    const geminiPool = new GeminiPool({
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 40000,
      topP: 0.8,
      topK: 40,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000
    })

    const agentService = new AgentService(prisma, geminiPool)
    const ideaService = new IdeaService(prisma, agentService)
    const reviewService = new ReviewService(prisma, agentService)
    const tournamentService = new TournamentService(prisma, agentService)
    const decisionService = new DecisionService(prisma, agentService)

    sessionService = new SessionService(prisma)
    orchestratorService = new OrchestratorService(
      prisma,
      agentService,
      ideaService,
      reviewService,
      tournamentService,
      decisionService
    )

    testApiKey = process.env.GEMINI_API_KEY || 'test-api-key'
  })

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: testUserId } })
    await prisma.$disconnect()
  })

  it('should complete full session workflow', async () => {
    // Step 1: Create session
    const session = await sessionService.createSession(testUserId, {
      coreIdea: 'قصة خيال علمي عن ذكاء اصطناعي يكتشف المشاعر الإنسانية',
      genre: 'Sci-Fi',
      targetAudience: 'البالغون 25-45',
      themes: ['الذكاء الاصطناعي', 'المشاعر', 'الإنسانية']
    })

    expect(session).toBeDefined()
    expect(session.status).toBe('initializing')

    // Step 2: Initialize session (create agent team)
    await orchestratorService.initializeSession(session.id, testApiKey)
    
    const agents = await agentService.getAgentsBySession(session.id)
    expect(agents).toHaveLength(11)

    // Step 3: Get session progress
    const progress = await orchestratorService.getSessionProgress(session.id)
    expect(progress.currentPhase).toBe('brief')
    expect(progress.progress).toBeGreaterThanOrEqual(0)

    // Note: Full workflow test would require actual Gemini API key
    // Remaining steps would be:
    // - Start idea generation phase
    // - Start review phase
    // - Start tournament phase
    // - Start decision phase

    logger.info('Session workflow test completed', {
      sessionId: session.id,
      agentCount: agents.length,
      progress
    })
  }, 60000) // 60 second timeout for this test
})

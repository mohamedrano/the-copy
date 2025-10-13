import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { AgentService } from '../../src/services/agent.service'
import { GeminiPool } from '../../src/integrations/gemini/pool'

describe('AgentService', () => {
  let prisma: PrismaClient
  let agentService: AgentService
  let geminiPool: GeminiPool
  let testSessionId: string

  beforeEach(async () => {
    prisma = new PrismaClient()
    geminiPool = new GeminiPool({
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 40000,
      topP: 0.8,
      topK: 40,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000
    })
    agentService = new AgentService(prisma, geminiPool)

    // Create test session
    const session = await prisma.session.create({
      data: {
        userId: 'test-user-id',
        status: 'initializing',
        currentPhase: 'brief'
      }
    })
    testSessionId = session.id
  })

  afterEach(async () => {
    // Cleanup
    await prisma.session.delete({ where: { id: testSessionId } })
    await prisma.$disconnect()
  })

  describe('createAgentTeam', () => {
    it('should create 11 agents for a session', async () => {
      const agents = await agentService.createAgentTeam(testSessionId, 'test-api-key')
      
      expect(agents).toHaveLength(11)
      expect(agents[0]).toHaveProperty('id')
      expect(agents[0]).toHaveProperty('agentType')
      expect(agents[0]).toHaveProperty('agentName')
    })

    it('should create agents with correct types', async () => {
      const agents = await agentService.createAgentTeam(testSessionId, 'test-api-key')
      
      const agentTypes = agents.map(a => a.agentType)
      expect(agentTypes).toContain('story_architect')
      expect(agentTypes).toContain('character_development')
      expect(agentTypes).toContain('realism_critic')
    })
  })

  describe('getAgentsBySession', () => {
    it('should return agents for a session', async () => {
      await agentService.createAgentTeam(testSessionId, 'test-api-key')
      const agents = await agentService.getAgentsBySession(testSessionId)
      
      expect(agents).toHaveLength(11)
    })

    it('should return empty array for session with no agents', async () => {
      const agents = await agentService.getAgentsBySession('non-existent-session')
      
      expect(agents).toHaveLength(0)
    })
  })

  describe('updateAgentStatus', () => {
    it('should update agent status', async () => {
      const agents = await agentService.createAgentTeam(testSessionId, 'test-api-key')
      const agent = agents[0]
      
      await agentService.updateAgentStatus(agent.id, 'inactive')
      
      const updatedAgent = await agentService.getAgentById(agent.id)
      expect(updatedAgent?.isActive).toBe(false)
    })
  })
})

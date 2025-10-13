import { api } from './api'
import { Agent, UpdateAgentConfigRequest, TestAgentRequest, TestAgentResponse, AgentStats } from '../types/agent.types'

export const agentService = {
  async getAll(): Promise<Agent[]> {
    const response = await api.get('/agents')
    return response.data
  },

  async getById(id: string): Promise<Agent> {
    const response = await api.get(`/agents/${id}`)
    return response.data
  },

  async getBySession(sessionId: string): Promise<Agent[]> {
    const response = await api.get(`/sessions/${sessionId}/agents`)
    return response.data
  },

  async activate(id: string): Promise<Agent> {
    const response = await api.post(`/agents/${id}/activate`)
    return response.data
  },

  async deactivate(id: string): Promise<Agent> {
    const response = await api.post(`/agents/${id}/deactivate`)
    return response.data
  },

  async updateConfig(id: string, config: UpdateAgentConfigRequest): Promise<Agent> {
    const response = await api.put(`/agents/${id}/config`, config)
    return response.data
  },

  async test(id: string, testData: TestAgentRequest): Promise<TestAgentResponse> {
    const response = await api.post(`/agents/${id}/test`, testData)
    return response.data
  },

  async getStats(id: string): Promise<AgentStats> {
    const response = await api.get(`/agents/${id}/stats`)
    return response.data
  }
}


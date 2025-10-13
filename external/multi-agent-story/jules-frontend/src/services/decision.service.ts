import { api } from './api'
import { Decision, MakeDecisionRequest, DecisionStats } from '../types/decision.types'

export const decisionService = {
  async getBySession(sessionId: string): Promise<Decision> {
    const response = await api.get(`/sessions/${sessionId}/decision`)
    return response.data
  },

  async make(sessionId: string, request: MakeDecisionRequest): Promise<Decision> {
    const response = await api.post(`/sessions/${sessionId}/decision/make`, request)
    return response.data
  },

  async getStats(decisionId: string): Promise<DecisionStats> {
    const response = await api.get(`/decisions/${decisionId}/stats`)
    return response.data
  }
}


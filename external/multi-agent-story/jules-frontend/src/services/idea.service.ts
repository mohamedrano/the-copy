import { api } from './api'
import { Idea, GenerateIdeasRequest, UpdateIdeaRequest, IdeaProgress } from '../types/idea.types'

export const ideaService = {
  async getAll(): Promise<Idea[]> {
    const response = await api.get('/ideas')
    return response.data
  },

  async getById(id: string): Promise<Idea> {
    const response = await api.get(`/ideas/${id}`)
    return response.data
  },

  async getBySession(sessionId: string): Promise<Idea[]> {
    const response = await api.get(`/sessions/${sessionId}/ideas`)
    return response.data
  },

  async generate(sessionId: string, request: GenerateIdeasRequest): Promise<Idea[]> {
    const response = await api.post(`/sessions/${sessionId}/ideas/generate`, request)
    return response.data
  },

  async update(id: string, data: UpdateIdeaRequest): Promise<Idea> {
    const response = await api.put(`/ideas/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/ideas/${id}`)
  },

  async regenerate(id: string): Promise<Idea> {
    const response = await api.post(`/ideas/${id}/regenerate`)
    return response.data
  },

  async getProgress(sessionId: string): Promise<IdeaProgress> {
    const response = await api.get(`/sessions/${sessionId}/ideas/progress`)
    return response.data
  }
}


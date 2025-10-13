import { api } from './api'
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest, TestApiKeyResponse } from '../types/api.types'

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    const response = await api.get('/api-keys')
    return response.data
  },

  async getById(id: string): Promise<ApiKey> {
    const response = await api.get(`/api-keys/${id}`)
    return response.data
  },

  async create(data: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await api.post('/api-keys', data)
    return response.data
  },

  async update(id: string, data: UpdateApiKeyRequest): Promise<ApiKey> {
    const response = await api.put(`/api-keys/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api-keys/${id}`)
  },

  async test(id: string): Promise<TestApiKeyResponse> {
    const response = await api.post(`/api-keys/${id}/test`)
    return response.data
  },

  async setActive(id: string): Promise<ApiKey> {
    const response = await api.post(`/api-keys/${id}/set-active`)
    return response.data
  }
}


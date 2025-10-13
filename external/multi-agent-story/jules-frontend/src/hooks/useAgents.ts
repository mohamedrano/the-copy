import { useState, useEffect } from 'react'
import { agentService } from '../services/agent.service'
import { Agent } from '../types/agent.types'

export function useAgents(sessionId?: string) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAgents = async (sessionId?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = sessionId 
        ? await agentService.getBySession(sessionId)
        : await agentService.getAll()
      setAgents(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الوكلاء')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getAgent = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await agentService.getById(id)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الوكيل')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const activateAgent = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedAgent = await agentService.activate(id)
      setAgents(prev => prev.map(agent => agent.id === id ? updatedAgent : agent))
      return updatedAgent
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تفعيل الوكيل')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deactivateAgent = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedAgent = await agentService.deactivate(id)
      setAgents(prev => prev.map(agent => agent.id === id ? updatedAgent : agent))
      return updatedAgent
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إلغاء تفعيل الوكيل')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateAgentConfig = async (id: string, config: Partial<Agent>) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedAgent = await agentService.updateConfig(id, config)
      setAgents(prev => prev.map(agent => agent.id === id ? updatedAgent : agent))
      return updatedAgent
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث إعدادات الوكيل')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const testAgent = async (id: string, testPrompt: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await agentService.test(id, testPrompt)
      return result
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء اختبار الوكيل')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getAgentStats = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const stats = await agentService.getStats(id)
      return stats
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل إحصائيات الوكيل')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAgents(sessionId)
  }, [sessionId])

  return {
    agents,
    isLoading,
    error,
    loadAgents,
    getAgent,
    activateAgent,
    deactivateAgent,
    updateAgentConfig,
    testAgent,
    getAgentStats
  }
}


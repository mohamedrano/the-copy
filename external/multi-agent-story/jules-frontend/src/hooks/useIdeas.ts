import { useState, useEffect } from 'react'
import { ideaService } from '../services/idea.service'
import { Idea, GenerateIdeasRequest } from '../types/idea.types'

export function useIdeas(sessionId?: string) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadIdeas = async (sessionId?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = sessionId 
        ? await ideaService.getBySession(sessionId)
        : await ideaService.getAll()
      setIdeas(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الأفكار')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getIdea = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ideaService.getById(id)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الفكرة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const generateIdeas = async (sessionId: string, request: GenerateIdeasRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ideaService.generate(sessionId, request)
      setIdeas(prev => [...prev, ...data])
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء توليد الأفكار')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateIdea = async (id: string, ideaData: Partial<Idea>) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedIdea = await ideaService.update(id, ideaData)
      setIdeas(prev => prev.map(idea => idea.id === id ? updatedIdea : idea))
      return updatedIdea
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث الفكرة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteIdea = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await ideaService.delete(id)
      setIdeas(prev => prev.filter(idea => idea.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حذف الفكرة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateIdea = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedIdea = await ideaService.regenerate(id)
      setIdeas(prev => prev.map(idea => idea.id === id ? updatedIdea : idea))
      return updatedIdea
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إعادة توليد الفكرة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getIdeaProgress = async (sessionId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const progress = await ideaService.getProgress(sessionId)
      return progress
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل تقدم توليد الأفكار')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadIdeas(sessionId)
    }
  }, [sessionId])

  return {
    ideas,
    isLoading,
    error,
    loadIdeas,
    getIdea,
    generateIdeas,
    updateIdea,
    deleteIdea,
    regenerateIdea,
    getIdeaProgress
  }
}


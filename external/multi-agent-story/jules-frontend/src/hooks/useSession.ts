import { useState, useEffect } from 'react'
import { sessionService } from '../services/session.service'
import { Session, CreateSessionRequest } from '../types/session.types'

export function useSession(sessionId?: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSession = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await sessionService.getById(id)
      setSession(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await sessionService.getAll()
      setSessions(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الجلسات')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async (sessionData: CreateSessionRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const newSession = await sessionService.create(sessionData)
      setSessions(prev => [newSession, ...prev])
      return newSession
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateSession = async (id: string, sessionData: Partial<Session>) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedSession = await sessionService.update(id, sessionData)
      setSession(prev => prev?.id === id ? updatedSession : prev)
      setSessions(prev => prev.map(s => s.id === id ? updatedSession : s))
      return updatedSession
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSession = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await sessionService.delete(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (session?.id === id) {
        setSession(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حذف الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedSession = await sessionService.start(id)
      setSession(prev => prev?.id === id ? updatedSession : prev)
      setSessions(prev => prev.map(s => s.id === id ? updatedSession : s))
      return updatedSession
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء بدء الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const pauseSession = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedSession = await sessionService.pause(id)
      setSession(prev => prev?.id === id ? updatedSession : prev)
      setSessions(prev => prev.map(s => s.id === id ? updatedSession : s))
      return updatedSession
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إيقاف الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resumeSession = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedSession = await sessionService.resume(id)
      setSession(prev => prev?.id === id ? updatedSession : prev)
      setSessions(prev => prev.map(s => s.id === id ? updatedSession : s))
      return updatedSession
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء استئناف الجلسة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  return {
    session,
    sessions,
    isLoading,
    error,
    loadSession,
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    pauseSession,
    resumeSession
  }
}


import { useState, useEffect } from 'react'
import { tournamentService } from '../services/tournament.service'
import { Tournament, TournamentTurn, StartTournamentRequest } from '../types/tournament.types'

export function useTournament(sessionId?: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [turns, setTurns] = useState<TournamentTurn[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTournament = async (sessionId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.getBySession(sessionId)
      setTournament(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loadTurns = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.getTurns(tournamentId)
      setTurns(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل أدوار البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startTournament = async (sessionId: string, request: StartTournamentRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.start(sessionId, request)
      setTournament(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء بدء البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const pauseTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.pause(tournamentId)
      setTournament(prev => prev?.id === tournamentId ? data : prev)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إيقاف البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resumeTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.resume(tournamentId)
      setTournament(prev => prev?.id === tournamentId ? data : prev)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء استئناف البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getTurn = async (tournamentId: string, turnNumber: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.getTurn(tournamentId, turnNumber)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل دور البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getTournamentProgress = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const progress = await tournamentService.getProgress(tournamentId)
      return progress
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل تقدم البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getTournamentStats = async (tournamentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const stats = await tournamentService.getStats(tournamentId)
      return stats
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل إحصائيات البطولة')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const voteOnTurn = async (tournamentId: string, turnNumber: number, vote: { ideaId: string; reason: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tournamentService.vote(tournamentId, turnNumber, vote)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التصويت')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadTournament(sessionId)
    }
  }, [sessionId])

  useEffect(() => {
    if (tournament?.id) {
      loadTurns(tournament.id)
    }
  }, [tournament?.id])

  return {
    tournament,
    turns,
    isLoading,
    error,
    loadTournament,
    loadTurns,
    startTournament,
    pauseTournament,
    resumeTournament,
    getTurn,
    getTournamentProgress,
    getTournamentStats,
    voteOnTurn
  }
}


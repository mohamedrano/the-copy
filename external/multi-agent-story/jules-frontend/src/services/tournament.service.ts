import { api } from './api'
import { Tournament, TournamentTurn, StartTournamentRequest, VoteRequest, TournamentProgress, TournamentStats } from '../types/tournament.types'

export const tournamentService = {
  async getBySession(sessionId: string): Promise<Tournament> {
    const response = await api.get(`/sessions/${sessionId}/tournament`)
    return response.data
  },

  async getTurns(tournamentId: string): Promise<TournamentTurn[]> {
    const response = await api.get(`/tournaments/${tournamentId}/turns`)
    return response.data
  },

  async getTurn(tournamentId: string, turnNumber: number): Promise<TournamentTurn> {
    const response = await api.get(`/tournaments/${tournamentId}/turns/${turnNumber}`)
    return response.data
  },

  async start(sessionId: string, request: StartTournamentRequest): Promise<Tournament> {
    const response = await api.post(`/sessions/${sessionId}/tournament/start`, request)
    return response.data
  },

  async pause(tournamentId: string): Promise<Tournament> {
    const response = await api.post(`/tournaments/${tournamentId}/pause`)
    return response.data
  },

  async resume(tournamentId: string): Promise<Tournament> {
    const response = await api.post(`/tournaments/${tournamentId}/resume`)
    return response.data
  },

  async vote(tournamentId: string, turnNumber: number, vote: VoteRequest): Promise<TournamentTurn> {
    const response = await api.post(`/tournaments/${tournamentId}/turns/${turnNumber}/vote`, vote)
    return response.data
  },

  async getProgress(tournamentId: string): Promise<TournamentProgress> {
    const response = await api.get(`/tournaments/${tournamentId}/progress`)
    return response.data
  },

  async getStats(tournamentId: string): Promise<TournamentStats> {
    const response = await api.get(`/tournaments/${tournamentId}/stats`)
    return response.data
  }
}


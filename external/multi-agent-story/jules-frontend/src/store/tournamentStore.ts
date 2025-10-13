import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Tournament, TournamentTurn } from '../types/tournament.types'

interface TournamentState {
  tournament: Tournament | null
  turns: TournamentTurn[]
  currentTurn: number
  isLoading: boolean
  error: string | null

  // Actions
  setTournament: (tournament: Tournament | null) => void
  setTurns: (turns: TournamentTurn[]) => void
  setCurrentTurn: (turn: number) => void
  addTurn: (turn: TournamentTurn) => void
  updateTurn: (turn: TournamentTurn) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useTournamentStore = create<TournamentState>()(
  devtools(
    (set, get) => ({
      tournament: null,
      turns: [],
      currentTurn: 1,
      isLoading: false,
      error: null,

      setTournament: (tournament) =>
        set({ tournament }),

      setTurns: (turns) =>
        set({ turns }),

      setCurrentTurn: (turn) =>
        set({ currentTurn: turn }),

      addTurn: (turn) =>
        set((state) => ({
          turns: [...state.turns, turn]
        })),

      updateTurn: (turn) =>
        set((state) => ({
          turns: state.turns.map(t => t.turnNumber === turn.turnNumber ? turn : t)
        })),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setError: (error) =>
        set({ error }),

      clearError: () =>
        set({ error: null })
    })
  )
)


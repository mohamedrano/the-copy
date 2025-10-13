import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Session } from '../types/session.types'

interface SessionState {
  currentSession: Session | null
  sessions: Session[]
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentSession: (session: Session | null) => void
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (session: Session) => void
  removeSession: (sessionId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        sessions: [],
        isLoading: false,
        error: null,

        setCurrentSession: (session) =>
          set({ currentSession: session }),

        setSessions: (sessions) =>
          set({ sessions }),

        addSession: (session) =>
          set((state) => ({
            sessions: [session, ...state.sessions]
          })),

        updateSession: (session) =>
          set((state) => ({
            sessions: state.sessions.map(s => s.id === session.id ? session : s),
            currentSession: state.currentSession?.id === session.id ? session : state.currentSession
          })),

        removeSession: (sessionId) =>
          set((state) => ({
            sessions: state.sessions.filter(s => s.id !== sessionId),
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
          })),

        setLoading: (loading) =>
          set({ isLoading: loading }),

        setError: (error) =>
          set({ error }),

        clearError: () =>
          set({ error: null })
      }),
      {
        name: 'session-storage',
        partialize: (state) => ({
          currentSession: state.currentSession,
          sessions: state.sessions
        })
      }
    )
  )
)


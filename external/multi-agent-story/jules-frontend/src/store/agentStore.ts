import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Agent } from '../types/agent.types'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  isLoading: boolean
  error: string | null

  // Actions
  setAgents: (agents: Agent[]) => void
  setSelectedAgent: (agent: Agent | null) => void
  updateAgent: (agent: Agent) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAgentStore = create<AgentState>()(
  devtools(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      isLoading: false,
      error: null,

      setAgents: (agents) =>
        set({ agents }),

      setSelectedAgent: (agent) =>
        set({ selectedAgent: agent }),

      updateAgent: (agent) =>
        set((state) => ({
          agents: state.agents.map(a => a.id === agent.id ? agent : a),
          selectedAgent: state.selectedAgent?.id === agent.id ? agent : state.selectedAgent
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


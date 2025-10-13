import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Idea } from '../types/idea.types'

interface IdeaState {
  ideas: Idea[]
  selectedIdea: Idea | null
  isLoading: boolean
  error: string | null

  // Actions
  setIdeas: (ideas: Idea[]) => void
  setSelectedIdea: (idea: Idea | null) => void
  addIdea: (idea: Idea) => void
  updateIdea: (idea: Idea) => void
  removeIdea: (ideaId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useIdeaStore = create<IdeaState>()(
  devtools(
    (set, get) => ({
      ideas: [],
      selectedIdea: null,
      isLoading: false,
      error: null,

      setIdeas: (ideas) =>
        set({ ideas }),

      setSelectedIdea: (idea) =>
        set({ selectedIdea: idea }),

      addIdea: (idea) =>
        set((state) => ({
          ideas: [...state.ideas, idea]
        })),

      updateIdea: (idea) =>
        set((state) => ({
          ideas: state.ideas.map(i => i.id === idea.id ? idea : i),
          selectedIdea: state.selectedIdea?.id === idea.id ? idea : state.selectedIdea
        })),

      removeIdea: (ideaId) =>
        set((state) => ({
          ideas: state.ideas.filter(i => i.id !== ideaId),
          selectedIdea: state.selectedIdea?.id === ideaId ? null : state.selectedIdea
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


import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  lastMessage?: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  agent: string;
  score: number;
  feedback: Record<string, string>;
}

interface Session {
  id: string;
  brief: string;
  phase: number;
  status: 'active' | 'completed' | 'paused' | 'error';
  ideas: Idea[];
  winner?: Idea;
  startTime: Date;
  endTime?: Date;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  
  // Session
  currentSession: Session | null;
  sessions: Session[];
  
  // Agents
  agents: Agent[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  activePhase: number;
  
  // Actions
  setAuth: (user: any, token: string) => void;
  logout: () => void;
  setCurrentSession: (session: Session) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  setActivePhase: (phase: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  currentSession: null,
  sessions: [],
  agents: [],
  isLoading: false,
  error: null,
  activePhase: 1,
};

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setAuth: (user, token) => set({
          isAuthenticated: true,
          user,
          token,
        }),
        
        logout: () => {
          localStorage.removeItem('auth_token');
          set(initialState);
        },
        
        setCurrentSession: (session) => set({ currentSession: session }),
        
        setSessions: (sessions) => set({ sessions }),
        
        addSession: (session) => set((state) => ({
          sessions: [...state.sessions, session],
        })),
        
        updateSession: (sessionId, updates) => set((state) => ({
          sessions: state.sessions.map((s) => 
            s.id === sessionId ? { ...s, ...updates } : s
          ),
          currentSession: state.currentSession?.id === sessionId 
            ? { ...state.currentSession, ...updates }
            : state.currentSession,
        })),
        
        setAgents: (agents) => set({ agents }),
        
        updateAgent: (agentId, updates) => set((state) => ({
          agents: state.agents.map((a) => 
            a.id === agentId ? { ...a, ...updates } : a
          ),
        })),
        
        setActivePhase: (phase) => set({ activePhase: phase }),
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        setError: (error) => set({ error }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'jules-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token,
        }),
      }
    )
  )
);

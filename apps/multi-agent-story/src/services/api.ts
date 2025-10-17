import axios from 'axios';
import type { Agent, Idea, Session } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add credentials to all requests for cookie support
api.defaults.withCredentials = true;

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        await api.post('/api/auth/refresh');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

type SessionResponse = Omit<Session, 'startTime' | 'endTime'> & {
  startTime: string;
  endTime?: string | null;
};

const mapSession = (session: SessionResponse): Session => ({
  ...session,
  startTime: new Date(session.startTime),
  endTime: session.endTime ? new Date(session.endTime) : undefined,
});

// Session management
export const sessionService = {
  createSession: async (brief: string): Promise<Session> => {
    const response = await api.post('/sessions', { brief });
    return mapSession(response.data as SessionResponse);
  },

  getSession: async (sessionId: string): Promise<Session> => {
    const response = await api.get(`/sessions/${sessionId}`);
    return mapSession(response.data as SessionResponse);
  },

  listSessions: async (): Promise<Session[]> => {
    const response = await api.get('/sessions');
    return (response.data as SessionResponse[]).map(mapSession);
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/sessions/${sessionId}`);
  }
};

// Agent management
export const agentService = {
  getAgents: async (): Promise<Agent[]> => {
    const response = await api.get('/agents');
    return response.data as Agent[];
  },

  getAgentStatus: async (agentId: string): Promise<Agent> => {
    const response = await api.get(`/agents/${agentId}/status`);
    return response.data as Agent;
  },

  executeAgent: async (
    agentId: string,
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<unknown> => {
    const response = await api.post(`/agents/${agentId}/execute`, {
      sessionId,
      data
    });
    return response.data;
  }
};

// Ideas management
export const ideaService = {
  getIdeas: async (sessionId: string): Promise<Idea[]> => {
    const response = await api.get(`/sessions/${sessionId}/ideas`);
    return response.data as Idea[];
  },

  createIdea: async (sessionId: string, idea: Idea): Promise<Idea> => {
    const response = await api.post(`/sessions/${sessionId}/ideas`, idea);
    return response.data as Idea;
  },

  updateIdea: async (
    sessionId: string,
    ideaId: string,
    updates: Partial<Idea>
  ): Promise<Idea> => {
    const response = await api.patch(`/sessions/${sessionId}/ideas/${ideaId}`, updates);
    return response.data as Idea;
  },

  selectWinner: async (sessionId: string, ideaId: string): Promise<Idea> => {
    const response = await api.post(`/sessions/${sessionId}/ideas/${ideaId}/win`);
    return response.data as Idea;
  }
};

// WebSocket message types
interface WebSocketMessage {
  type: string;
  data?: unknown;
  sessionId?: string;
  agentId?: string;
  timestamp?: string;
}

interface WebSocketEventMap {
  connected: void;
  disconnected: void;
  error: Error;
  sessionUpdate: { sessionId: string; status: string };
  agentUpdate: { agentId: string; status: string; result?: unknown };
  ideaUpdate: { sessionId: string; idea: Idea };
  winnerSelected: { sessionId: string; ideaId: string };
}

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<keyof WebSocketEventMap, Set<(payload: WebSocketEventMap[keyof WebSocketEventMap]) => void>> = new Map();
  
  connect(sessionId: string) {
    if (this.ws) {
      this.disconnect();
    }
    
    // WebSocket will automatically include cookies due to same-origin policy
    const wsUrl = `${WS_URL}/ws/${sessionId}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connected');
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    };
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
  
  on(event: string, callback: (payload: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: (payload: unknown) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  send(type: string, data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }
}

export const wsService = new WebSocketService();

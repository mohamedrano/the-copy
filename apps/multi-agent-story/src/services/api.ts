import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Session management
export const sessionService = {
  createSession: async (brief: string) => {
    const response = await api.post('/sessions', { brief });
    return response.data;
  },
  
  getSession: async (sessionId: string) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },
  
  listSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },
  
  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  }
};

// Agent management
export const agentService = {
  getAgents: async () => {
    const response = await api.get('/agents');
    return response.data;
  },
  
  getAgentStatus: async (agentId: string) => {
    const response = await api.get(`/agents/${agentId}/status`);
    return response.data;
  },
  
  executeAgent: async (agentId: string, sessionId: string, data: any) => {
    const response = await api.post(`/agents/${agentId}/execute`, { 
      sessionId, 
      data 
    });
    return response.data;
  }
};

// Ideas management
export const ideaService = {
  getIdeas: async (sessionId: string) => {
    const response = await api.get(`/sessions/${sessionId}/ideas`);
    return response.data;
  },
  
  createIdea: async (sessionId: string, idea: any) => {
    const response = await api.post(`/sessions/${sessionId}/ideas`, idea);
    return response.data;
  },
  
  updateIdea: async (sessionId: string, ideaId: string, updates: any) => {
    const response = await api.patch(`/sessions/${sessionId}/ideas/${ideaId}`, updates);
    return response.data;
  },
  
  selectWinner: async (sessionId: string, ideaId: string) => {
    const response = await api.post(`/sessions/${sessionId}/ideas/${ideaId}/win`);
    return response.data;
  }
};

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  connect(sessionId: string) {
    if (this.ws) {
      this.disconnect();
    }
    
    const token = localStorage.getItem('auth_token');
    const wsUrl = `${WS_URL}/ws/${sessionId}?token=${token}`;
    
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
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.off(event, callback);
    };
  }
  
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }
}

export const wsService = new WebSocketService();

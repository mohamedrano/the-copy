export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface ProgressUpdate {
  phase: string;
  progress: number;
  message: string;
  data?: any;
}

export interface PhaseComplete {
  phase: string;
  data: any;
  nextPhase?: string;
}

export interface WebSocketEvents {
  progress: ProgressUpdate;
  phase_complete: PhaseComplete;
  error: ErrorResponse;
  echo: WebSocketMessage;
  pong: { timestamp: string };
}

// Base API types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// API Key types
export interface ApiKey {
  id: string
  userId: string
  keyName: string
  isActive: boolean
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateApiKeyRequest {
  keyName: string
  apiKey: string
}

export interface UpdateApiKeyRequest {
  keyName?: string
  apiKey?: string
}

export interface TestApiKeyResponse {
  isValid: boolean
  message: string
  usage?: {
    requests: number
    tokens: number
  }
}

// WebSocket types
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
}

export interface ProgressUpdate {
  phase: string
  progress: number
  message: string
  details?: any
}

export interface PhaseComplete {
  phase: string
  result: any
  nextPhase?: string
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: ValidationError[]
  details?: any
}


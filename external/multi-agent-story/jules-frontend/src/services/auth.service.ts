import { apiClient } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  accessToken: string
  refreshToken: string
}

export interface ApiKeyResponse {
  id: string
  keyName: string
  isActive: boolean
  lastUsedAt?: string
  createdAt: string
}

export interface ApiKeyRequest {
  apiKey: string
  keyName: string
}

export const authService = {
  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'فشل في تسجيل الدخول')
    }
    
    return response.data
  },

  // Register user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'فشل في إنشاء الحساب')
    }
    
    return response.data
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/api/v1/auth/refresh', {
      refreshToken,
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'فشل في تحديث التوكن')
    }
    
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get<{ user: AuthResponse['user'] }>('/api/v1/auth/me')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'فشل في جلب بيانات المستخدم')
    }
    
    return response.data.user
  },

  // Add API key
  addApiKey: async (data: ApiKeyRequest): Promise<ApiKeyResponse> => {
    const response = await apiClient.post<ApiKeyResponse>('/api/v1/auth/api-keys', data)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'فشل في إضافة مفتاح API')
    }
    
    return response.data
  },

  // Get API keys
  getApiKeys: async (): Promise<ApiKeyResponse[]> => {
    const response = await apiClient.get<{ apiKeys: ApiKeyResponse[] }>('/api/v1/auth/api-keys')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'فشل في جلب مفاتيح API')
    }
    
    return response.data.apiKeys
  },

  // Delete API key
  deleteApiKey: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/api/v1/auth/api-keys/${id}`)
    
    if (!response.success) {
      throw new Error(response.error || 'فشل في حذف مفتاح API')
    }
  },
}


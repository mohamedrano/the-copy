export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface ApiKeyRequest {
  apiKey: string;
  keyName: string;
}

export interface ApiKeyResponse {
  id: string;
  keyName: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
}

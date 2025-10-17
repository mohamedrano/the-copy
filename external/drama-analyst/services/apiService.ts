import { AIRequest, AIResponse, Result } from '@core/types';
import { callModel as callGeminiDirect } from './geminiService';
import { callBackendAPI, checkBackendHealth } from './backendService';
import { log } from './loggerService';
import { handleAPIError, handleNetworkError, ErrorType } from './errorHandler';

// =====================================================
// Unified API Service
// =====================================================

interface APIServiceConfig {
  useBackend: boolean;
  fallbackToDirect: boolean;
  healthCheckInterval: number;
}

class APIService {
  private config: APIServiceConfig;
  private backendHealthy: boolean = false;
  private lastHealthCheck: number = 0;

  constructor() {
    this.config = {
      useBackend: import.meta.env.VITE_USE_BACKEND === 'true',
      fallbackToDirect: import.meta.env.VITE_FALLBACK_DIRECT === 'true',
      healthCheckInterval: 30000 // 30 seconds
    };

    // Initial health check
    this.checkBackendHealth();
  }

  private async checkBackendHealth(): Promise<void> {
    const now = Date.now();
    
    // Skip if checked recently
    if (now - this.lastHealthCheck < this.config.healthCheckInterval) {
      return;
    }

    try {
      this.backendHealthy = await checkBackendHealth();
      this.lastHealthCheck = now;
      
      log.debug(`🏥 Backend health check: ${this.backendHealthy ? 'healthy' : 'unhealthy'}`, null, 'APIService');
    } catch (error) {
      log.error('❌ Backend health check failed', error, 'APIService');
      this.backendHealthy = false;
      this.lastHealthCheck = now;
    }
  }

  async callModel(req: AIRequest): Promise<Result<AIResponse>> {
    // Check backend health if using backend
    if (this.config.useBackend) {
      await this.checkBackendHealth();
    }

    // Try backend first if configured and healthy
    if (this.config.useBackend && this.backendHealthy) {
      log.info('🔄 Using backend API...', null, 'APIService');
      
      const result = await callBackendAPI(req);
      
      if (result.ok) {
        log.info('✅ Backend API call successful', null, 'APIService');
        return result;
      } else {
        log.warn('⚠️ Backend API failed, checking fallback options', null, 'APIService');
        
        // If fallback is disabled, return the error
        if (!this.config.fallbackToDirect) {
          return result;
        }
        
        // Mark backend as unhealthy and try direct
        this.backendHealthy = false;
      }
    }

    // Fallback to direct Gemini API
    if (this.config.fallbackToDirect || !this.config.useBackend) {
      log.info('🔄 Using direct Gemini API...', null, 'APIService');
      return callGeminiDirect(req);
    }

    // No fallback available
    return {
      ok: false,
      error: {
        code: 'NO_API_AVAILABLE',
        message: 'لا تتوفر خدمة API متاحة حاليًا. يرجى المحاولة لاحقاً.',
        cause: new Error('Both backend and direct API failed')
      }
    };
  }

  getConfig(): APIServiceConfig {
    return { ...this.config };
  }

  isBackendHealthy(): boolean {
    return this.backendHealthy;
  }
}

// Singleton instance
const apiService = new APIService();

// =====================================================
// Public API
// =====================================================

export async function callModel(req: AIRequest): Promise<Result<AIResponse>> {
  return apiService.callModel(req);
}

export function getAPIConfig() {
  return apiService.getConfig();
}

export function isBackendHealthy() {
  return apiService.isBackendHealthy();
}

export { APIService };

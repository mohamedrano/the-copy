import { AIRequest, AIResponse, Result } from '@core/types';
import { sanitization } from './sanitizationService';
import { log } from './loggerService';

// =====================================================
// Backend Service Configuration
// =====================================================

interface BackendConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

class BackendService {
  private config: BackendConfig;

  constructor() {
    this.config = {
      baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
      timeout: 60000,
      retries: 3
    };
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async analyzeText(request: AIRequest): Promise<Result<AIResponse>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        log.debug(`🔄 Backend API call attempt ${attempt}/${this.config.retries}`, null, 'BackendService');

        // Sanitize request before sending
        const sanitizedRequest = sanitization.aiRequest(request);
        const response = await this.makeRequest<AIResponse>('/api/analyze', sanitizedRequest);
        
        log.info('✅ Backend API call successful', null, 'BackendService');
        
        // Sanitize response before returning
        const sanitizedResponse = sanitization.aiResponse(response);
        return { ok: true, value: sanitizedResponse };

      } catch (error: any) {
        lastError = error;
        log.error(`❌ Backend API error (attempt ${attempt})`, error, 'BackendService');

        if (attempt < this.config.retries) {
          const delay = 1000 * attempt;
          log.debug(`⏳ Retrying in ${delay}ms...`, null, 'BackendService');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Handle specific error cases
    let userMessage = 'فشل الاتصال بخادم التحليل';
    let errorCode = 'BACKEND_CALL_FAILED';

    if (lastError?.message?.includes('timeout')) {
      userMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
      errorCode = 'REQUEST_TIMEOUT';
    } else if (lastError?.message?.includes('429')) {
      userMessage = 'تم تجاوز حد الطلبات. يرجى الانتظار قليلاً.';
      errorCode = 'RATE_LIMIT_EXCEEDED';
    } else if (lastError?.message?.includes('413')) {
      userMessage = 'حجم الملف كبير جداً. يرجى اختيار ملف أصغر.';
      errorCode = 'FILE_TOO_LARGE';
    } else if (lastError?.message?.includes('400')) {
      userMessage = 'طلب غير صالح. يرجى التحقق من البيانات المرسلة.';
      errorCode = 'INVALID_REQUEST';
    }

    return {
      ok: false,
      error: {
        code: errorCode,
        message: userMessage,
        cause: lastError
      }
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      log.error('Health check failed', error, 'BackendService');
      return false;
    }
  }
}

// Singleton instance
const backendService = new BackendService();

// =====================================================
// Public API
// =====================================================

export async function callBackendAPI(req: AIRequest): Promise<Result<AIResponse>> {
  return backendService.analyzeText(req);
}

export async function checkBackendHealth(): Promise<boolean> {
  return backendService.healthCheck();
}

export { BackendService };

export const config = {
  api: {
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY,
    geminiModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
    timeout: 60000,
    retries: 3,
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
    useBackend: import.meta.env.VITE_USE_BACKEND === 'true',
    fallbackDirect: import.meta.env.VITE_FALLBACK_DIRECT === 'true'
  },
  app: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    supportedFormats: ['.txt', '.md', '.docx', '.pdf', '.png', '.jpg']
  }
};

// Validation
if (!config.api.geminiKey) {
  throw new Error('VITE_GEMINI_API_KEY is required');
}



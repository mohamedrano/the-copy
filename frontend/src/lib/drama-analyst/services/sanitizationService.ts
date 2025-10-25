/**
 * Sanitization Service for XSS Protection
 * Provides safe input/output sanitization for the frontend
 */

// =====================================================
// Sanitization Utilities
// =====================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Basic HTML sanitization - remove dangerous tags and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ''); // Remove style tags
};

/**
 * Sanitize text content by escaping HTML entities
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize file names to prevent directory traversal
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unknown.txt';
  }

  // Remove dangerous characters and paths
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '_') // Replace dangerous chars with underscore
    .replace(/\.\./g, '_') // Prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .trim()
    .substring(0, 255); // Limit length
};

/**
 * Sanitize URL to prevent open redirects and XSS
 */
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    // Remove javascript: and data: protocols
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      return '';
    }

    return urlObj.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize object properties recursively
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeText(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as T;
  }

  if (typeof obj === 'object') {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeText(key);
      (sanitized as any)[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Validate and sanitize user input for AI requests
 */
export const sanitizeAIRequest = (request: any) => {
  if (!request || typeof request !== 'object') {
    throw new Error('Invalid request format');
  }

  const sanitized = { ...request };

  // Sanitize agent name
  if (sanitized.agent && typeof sanitized.agent === 'string') {
    sanitized.agent = sanitizeText(sanitized.agent);
  }

  // Sanitize parameters
  if (sanitized.parameters && typeof sanitized.parameters === 'object') {
    sanitized.parameters = sanitizeObject(sanitized.parameters);
  }

  // Sanitize files
  if (sanitized.files && Array.isArray(sanitized.files)) {
    sanitized.files = sanitized.files.map((file: any) => {
      if (file && typeof file === 'object') {
        return {
          ...file,
          name: sanitizeFileName(file.name || ''),
          content: typeof file.content === 'string' ? sanitizeText(file.content) : file.content
        };
      }
      return file;
    });
  }

  return sanitized;
};

/**
 * Sanitize AI response content
 */
export const sanitizeAIResponse = (response: any) => {
  if (!response || typeof response !== 'object') {
    return response;
  }

  const sanitized = { ...response };

  // Sanitize raw content
  if (sanitized.raw && typeof sanitized.raw === 'string') {
    sanitized.raw = sanitizeHTML(sanitized.raw);
  }

  // Sanitize parsed content if it exists
  if (sanitized.parsed && typeof sanitized.parsed === 'object') {
    sanitized.parsed = sanitizeObject(sanitized.parsed);
  }

  return sanitized;
};

// =====================================================
// React-specific utilities
// =====================================================

/**
 * Safe HTML renderer for React components
 */
export const createSafeHTML = (html: string): { __html: string } => {
  return {
    __html: sanitizeHTML(html)
  };
};

/**
 * Validation utilities
 */
export const isValidTextInput = (input: any): boolean => {
  return typeof input === 'string' && input.length > 0 && input.length < 10000;
};

export const isValidFileName = (fileName: any): boolean => {
  if (typeof fileName !== 'string') return false;
  const sanitized = sanitizeFileName(fileName);
  return sanitized.length > 0 && sanitized !== 'unknown.txt';
};

export const isValidFileSize = (size: any): boolean => {
  return typeof size === 'number' && size > 0 && size <= 20 * 1024 * 1024; // 20MB
};

// =====================================================
// Export all sanitization functions
// =====================================================

export const sanitization = {
  html: sanitizeHTML,
  text: sanitizeText,
  fileName: sanitizeFileName,
  url: sanitizeURL,
  object: sanitizeObject,
  aiRequest: sanitizeAIRequest,
  aiResponse: sanitizeAIResponse,
  createSafeHTML,
  validation: {
    isValidTextInput,
    isValidFileName,
    isValidFileSize
  }
};

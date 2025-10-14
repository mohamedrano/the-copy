/**
 * Utility helpers that provide consistent sanitization and security
 * primitives across the application.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes a fragment of HTML using the shared DOMPurify instance to
 * mitigate cross-site scripting vulnerabilities in rendered output.
 *
 * @param dirty - Potentially unsafe HTML content originating from user input.
 * @returns A sanitized HTML string that may be safely injected into the DOM.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'div', 'span', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: ['class', 'style', 'dir'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

/**
 * Cleans markup intended for use inside contenteditable surfaces while
 * preserving essential formatting for Arabic screenplay editing.
 *
 * @param content - User-supplied HTML snippet from a contenteditable element.
 * @returns Sanitized markup that keeps basic structure without dangerous tags.
 */
export function sanitizeContentEditable(content: string): string {
  // Remove potentially dangerous elements while preserving Arabic text
  const cleaned = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['div', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['class', 'style', 'dir'],
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'meta'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
  });

  return cleaned;
}

/**
 * Normalizes generic user-provided strings by removing control characters
 * and bounding length to guard against injection and resource attacks.
 *
 * @param input - Free-form user input that may include unsafe characters.
 * @returns A cleaned and trimmed string suitable for downstream processing.
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters except newlines and tabs
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length to prevent DoS
  if (cleaned.length > 100000) {
    cleaned = cleaned.substring(0, 100000);
  }

  return cleaned.trim();
}

/**
 * Produces a safe filename derived from user input by stripping reserved
 * characters and normalizing length for cross-platform compatibility.
 *
 * @param filename - The raw filename suggested by the user or upstream code.
 * @returns A sanitized filename string that may be safely used for storage.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'untitled';

  // Remove dangerous characters
  const trimmed = filename.trim();
  const stripped = trimmed.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
  const withoutLeadingDots = stripped.replace(/^\.+/, '');
  const bounded = withoutLeadingDots.substring(0, 255).trim();

  return bounded || 'untitled';
}

/**
 * Canonical Content Security Policy directives applied when generating the
 * response headers for the Naqid web application.
 */
export const CSP_CONFIG = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline'",
  'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",
  'font-src': "'self' fonts.gstatic.com",
  'img-src': "'self' data: blob:",
  'connect-src': "'self' generativelanguage.googleapis.com",
  'frame-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
};

/**
 * Assembles the configured CSP directives into an HTTP header string that
 * can be attached to server responses.
 *
 * @returns A serialized Content-Security-Policy header value.
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
}
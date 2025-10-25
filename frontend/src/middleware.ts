import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for setting Content Security Policy headers
 *
 * This middleware adds CSP headers to all responses, with special handling
 * for development environments to allow hot reloading and external resources.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get the allowed development origin from environment
  const devOrigin = process.env.ALLOWED_DEV_ORIGIN || '';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Build CSP directives
  const cspDirectives = [
    "default-src 'self'",
    isDevelopment
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.googleapis.com"
      : "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai data:",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' https://apis.google.com https://*.googleapis.com wss: ws: ${devOrigin}`,
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];

  const csp = cspDirectives.filter(Boolean).join('; ');

  // Set CSP header
  res.headers.set('Content-Security-Policy', csp);

  // Add additional security headers
  if (!isDevelopment) {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return res;
}

/**
 * Configure which paths the middleware should run on
 * Excludes Next.js internal paths and static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

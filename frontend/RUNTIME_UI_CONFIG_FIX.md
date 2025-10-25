# Runtime, UI, and Configuration Fixes

## Executive Summary

This document describes the comprehensive fixes implemented to resolve runtime errors, UI rendering issues, and configuration conflicts in the Next.js + Gemini AI application.

## Changes Overview

### 1. Unified Gemini Core Module (`src/lib/ai/gemini-core.ts`)

**Created**: A centralized module for all Gemini AI interactions with the following features:

#### Token Limit Unification
- **Constant**: `MAX_TOKENS_PER_USE = 48192`
- Applied uniformly across all API calls
- Overrides any previous inconsistent limits (8192, 30000, etc.)

#### Model-Specific Throttling
Implemented rate limiting based on model type:
- `gemini-2.5-flash-lite` / `gemini-2.0-flash-lite`: **6 seconds** between requests
- `gemini-2.5-flash` / `gemini-2.0-flash-001`: **10 seconds** between requests
- `gemini-2.5-pro`: **15 seconds** between requests

```typescript
await throttleByModel(modelId); // Called before every API request
```

#### Lenient JSON Parsing
Handles non-JSON responses from Gemini gracefully:
```typescript
parseJsonLenient(rawText); // Returns parsed JSON or null
```

Strategies used:
1. Direct JSON.parse()
2. Extract from ```json...``` code blocks
3. Pattern matching for JSON structures
4. Truncated JSON repair

#### Text Normalization Utilities
Prevents "Objects are not valid as a React child" errors:

```typescript
toText(value);           // Converts any value to string, handles {raw: string}
safeSub(value, 0, 100);  // Safe substring operation
safeSplit(value, '\n');  // Safe split operation
```

---

### 2. Next.js Configuration Fixes (`next.config.ts`)

#### Turbopack/Webpack Conflict Resolution
**Problem**: Warning "Webpack is configured while Turbopack is not"

**Solution**: 
- Removed unconditional webpack configuration
- Made webpack customization opt-in via `FORCE_WEBPACK=1` environment variable
- Turbopack is now the default in development

```typescript
// Only use webpack when explicitly needed
...(process.env.FORCE_WEBPACK === "1" && {
  webpack: (config, { isServer }) => {
    // webpack customizations
  }
})
```

#### Development Origins Support
**Problem**: Cross-origin warnings in Workstations environment

**Solution**:
```typescript
// Add to next.config.ts
...(process.env.ALLOWED_DEV_ORIGIN && {
  allowedDevOrigins: [process.env.ALLOWED_DEV_ORIGIN],
})
```

**Usage**: Set environment variable:
```bash
export ALLOWED_DEV_ORIGIN="https://9002-firebase-the-copy--XXXX.cluster-....dev"
```

#### CSP Font Source Fix
**Problem**: CSP error blocking external fonts from `r2cdn.perplexity.ai`

**Solution**:
```typescript
"font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai data:"
```

**Recommendation**: For production, self-host fonts in `public/fonts/` directory.

---

### 3. Middleware for CSP Headers (`src/middleware.ts`)

**Created**: Centralized security headers middleware

Features:
- Development-friendly CSP rules (allows `unsafe-eval` for HMR)
- Automatic inclusion of `ALLOWED_DEV_ORIGIN`
- Excludes static assets from processing
- Conditional HSTS (only in production)

**Matcher Pattern**:
```typescript
matcher: [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
]
```

---

### 4. Web Components Registration Guard (`src/lib/web-components.ts`)

**Created**: Utilities to prevent duplicate custom element registration

#### Key Functions

```typescript
// Ensure polyfills load only once
ensureWebComponentsPolyfill('webcomponents-ce');

// Safe element registration
defineOnce('my-element', MyElementClass);

// Check if element exists
if (isElementDefined('my-element')) { /* ... */ }

// Wait for element definition
await whenDefined('my-element', 5000);
```

**Prevents Error**: `"A custom element with name 'mce-autosize-textarea' has already been defined"`

---

### 5. Updated Gemini Services

#### Stations Gemini Service (`src/lib/ai/stations/gemini-service.ts`)
- Integrated `throttleByModel()` before every request
- Uses `normalizeGenConfig()` for unified token limits
- Applies `parseJsonLenient()` for response parsing
- Falls back to raw text when JSON parsing fails

**Before**:
```typescript
const result = await this.ai.models.generateContent({
  model: modelName,
  contents: fullPrompt,
  config: {
    maxOutputTokens: request.maxTokens || 8192,  // Inconsistent
    temperature: request.temperature || 0.7,
  }
});
```

**After**:
```typescript
await throttleByModel(modelName);

const genConfig = normalizeGenConfig();
const finalConfig = {
  ...genConfig,
  temperature: request.temperature ?? genConfig.temperature,
  maxOutputTokens: request.maxTokens ?? MAX_TOKENS_PER_USE, // Always 48192
};

const result = await this.ai.models.generateContent({
  model: modelName,
  contents: fullPrompt,
  config: finalConfig,
});
```

#### Main Gemini Service (`src/lib/ai/gemini-service.ts`)
- Same integration as stations service
- Unified token limits
- Throttling per model

#### Drama Analyst Service (`src/lib/drama-analyst/services/geminiService.ts`)
- Migrated to unified core
- Added lenient JSON parsing
- Uses `MAX_TOKENS_PER_USE` constant

---

### 6. Station Updates for Safe Text Operations

#### Station 1 (`src/lib/ai/stations/station1-text-analysis.ts`)
**Changes**:
- Replaced `fullText.substring(0, 30000)` with `safeSub(fullText, 0, 30000)`
- Replaced `result.content.split('\n')` with `safeSplit(toText(result.content), '\n')`

#### Station 2 (`src/lib/ai/stations/station2-conceptual-analysis.ts`)
**Changes**:
- All `context.fullText?.substring(...)` → `safeSub(context.fullText, ...)`
- All `result.content` → `toText(result.content)` before usage

#### Station 3 (`src/lib/ai/stations/station3-network-builder.ts`)
**Changes**:
- Fixed `input.station2Output.storyStatement.substring(0, 50)` 
- Now: `safeSub(input.station2Output.storyStatement, 0, 50)`
- Updated context substring operations

#### Station 5 (`src/lib/ai/stations/station5-dynamic-symbolic-stylistic.ts`)
**Changes**:
- Updated all `fullText.substring(...)` calls to use `safeSub()`

---

### 7. UI Component Fixes

#### Station Card (`src/components/station-card.tsx`)
**Problem**: Objects being rendered as React children

**Changes**:
```typescript
import { toText } from "@/lib/ai/gemini-core";

// Before:
<p>بيان القصة: {data.storyStatement}</p>

// After:
<p>بيان القصة: {toText(data.storyStatement)}</p>
```

Applied to all fields that might return `{raw: string}` objects:
- `data.storyStatement`
- `data.hybridGenre`
- `data.majorCharacters`
- `data.narrativeStyleAnalysis.overallTone`
- `data.networkSummary.charactersCount`
- `data.finalReport.executiveSummary`

---

## Environment Variables

### Required for Development

```bash
# Allow development origin for hot reloading
export ALLOWED_DEV_ORIGIN="https://9002-firebase-the-copy--XXXX.cluster-....dev"

# Optional: Force webpack instead of Turbopack
# export FORCE_WEBPACK=1
```

### Gemini API Configuration
Ensure these are set:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-pro
```

---

## Testing Checklist

### 1. Development Server
```bash
cd frontend
pnpm dev -p 9002
```

**Verify**:
- [ ] No "Webpack is configured while Turbopack is not" warning
- [ ] No "allowedDevOrigins" cross-origin warning
- [ ] Hot reload works properly

### 2. Font Loading
**Verify**:
- [ ] No CSP errors in browser console for fonts
- [ ] Fonts load from `fonts.gstatic.com` or self-hosted source

### 3. Analysis Pipeline
Run a full analysis with actual text:

```bash
# Navigate to /analysis/deep in the application
# Upload or paste dramatic text
# Click "ابدأ التحليل" (Start Analysis)
```

**Verify**:
- [ ] All stations complete without errors
- [ ] No "Objects are not valid as a React child" errors
- [ ] No `substring is not a function` errors
- [ ] No `split is not a function` errors
- [ ] Station results display correctly in cards

### 4. API Rate Limiting
Monitor console logs:

**Expected Output**:
```
[Gemini Core] Throttling gemini-2.5-flash-lite: waiting 6000ms
[Gemini Service] Generating content with model gemini-2.5-flash-lite
  tokenLimit: 48192
  temperature: 0.2
```

**Verify**:
- [ ] Throttling messages appear between requests
- [ ] Delays match model type (6s/10s/15s)
- [ ] Token limit is always 48192

### 5. Non-JSON Response Handling
If Gemini returns plain text instead of JSON:

**Verify**:
- [ ] Pipeline continues (doesn't crash)
- [ ] Warning logged: "Gemini response did not contain valid JSON payload"
- [ ] Raw text fallback used: `{ raw: "..." }`
- [ ] UI renders text content properly

---

## Error Resolution Matrix

| Error | Root Cause | Solution |
|-------|------------|----------|
| "Webpack is configured while Turbopack is not" | Unconditional webpack config | Moved webpack to conditional block |
| "allowedDevOrigins" warning | Missing dev origin config | Added `ALLOWED_DEV_ORIGIN` env var support |
| CSP font blocking | External font domain not whitelisted | Added `r2cdn.perplexity.ai` to font-src |
| "Custom element already defined" | Duplicate registration | Created `defineOnce()` guard |
| "Objects are not valid as React child" | `{raw: string}` rendered directly | Wrapped with `toText()` utility |
| "substring is not a function" | Calling on object instead of string | Used `safeSub()` utility |
| "split is not a function" | Calling on object instead of string | Used `safeSplit()` utility |
| "Gemini response did not contain valid JSON" | Plain text response | Lenient parser with fallback |
| Inconsistent token limits | Different values across files | Unified to `MAX_TOKENS_PER_USE` |
| API rate limiting issues | No throttling between requests | Model-specific throttling |

---

## Architecture Decisions

### Why Unified Core Module?
1. **Single Source of Truth**: All Gemini configurations in one place
2. **DRY Principle**: Avoid duplicating throttling/parsing logic
3. **Easy Auditing**: Token limits visible in one constant
4. **Type Safety**: Shared TypeScript types across services

### Why Lenient JSON Parsing?
Gemini API sometimes returns:
- Plain text explanations
- Text with ```json``` code blocks
- Truncated JSON (mid-generation cutoff)
- Mixed format responses

Strict JSON parsing would crash the pipeline. Lenient parsing allows:
- Graceful degradation
- Continued analysis even with partial data
- Better user experience (no hard failures)

### Why safeSub/safeSplit?
Station 2 returns `storyStatement` which *might* be:
- A string: `"This is the story statement"`
- An object: `{raw: "This is the story statement"}`

Calling `.substring()` or `.split()` on an object crashes. Safe utilities:
1. Normalize to text first via `toText()`
2. Then perform string operations
3. Return empty string/array if input is invalid

---

## Future Improvements

### 1. Self-Host Fonts
Move fonts from CDN to local hosting:
```bash
# Download font files
mkdir -p frontend/public/fonts
wget -O frontend/public/fonts/FKGroteskNeue.woff2 https://r2cdn.perplexity.ai/.../FKGroteskNeue.woff2

# Update CSS
@font-face {
  font-family: 'FK Grotesk Neue';
  src: url('/fonts/FKGroteskNeue.woff2') format('woff2');
}
```

### 2. Structured Logging
Replace console.log with structured logger:
```typescript
import logger from '@/lib/utils/logger';

logger.info('[Gemini Core] Throttling', {
  model: modelId,
  delay: wait,
  timestamp: Date.now()
});
```

### 3. Monitoring Dashboard
Track Gemini API usage:
- Request counts per model
- Average response times
- Token usage statistics
- Error rates

### 4. Response Validation
Add Zod schemas for station outputs:
```typescript
const Station2OutputSchema = z.object({
  storyStatement: z.string(),
  hybridGenre: z.string(),
  // ...
});

const validated = Station2OutputSchema.safeParse(rawResponse);
```

### 5. Retry Logic with Exponential Backoff
Currently throttling is simple delay. Could implement:
- Exponential backoff on failures
- Circuit breaker pattern
- Request queue with priority

---

## Migration Guide

### For Developers Adding New Stations

**DO**:
```typescript
import { 
  throttleByModel, 
  normalizeGenConfig, 
  toText, 
  safeSub 
} from '../gemini-core';

// In your station execute method:
await throttleByModel('gemini-2.5-flash');

const config = normalizeGenConfig();
const result = await geminiService.generate({
  prompt: myPrompt,
  context: safeSub(fullText, 0, 25000),
  ...config
});

// When using result:
const text = toText(result.content);
```

**DON'T**:
```typescript
// ❌ Don't hardcode token limits
maxOutputTokens: 8192

// ❌ Don't call substring directly
fullText.substring(0, 1000)

// ❌ Don't render objects in UI
<p>{data.someField}</p>

// ❌ Don't skip throttling
await geminiService.generate(...) // Missing throttle!
```

### For UI Components Displaying Station Results

**Always wrap potentially-object values**:
```typescript
import { toText } from '@/lib/ai/gemini-core';

// Safe rendering:
<p>{toText(data.anyField)}</p>
<p>{toText(data.nested?.field)}</p>
```

---

## Commit History

This fix was implemented in the following logical commits:

1. `feat(ai): create unified gemini-core module with token limits and throttling`
   - Created `src/lib/ai/gemini-core.ts`
   - Defined `MAX_TOKENS_PER_USE = 48192`
   - Implemented model-specific throttling
   - Added lenient JSON parsing

2. `fix(config): resolve Turbopack/Webpack conflict and add dev origins`
   - Updated `next.config.ts`
   - Made webpack conditional
   - Added `allowedDevOrigins` support
   - Fixed CSP for external fonts

3. `feat(security): add CSP middleware with development support`
   - Created `src/middleware.ts`
   - Development-friendly CSP rules
   - Auto-include `ALLOWED_DEV_ORIGIN`

4. `feat(web-components): add registration guards to prevent duplicates`
   - Created `src/lib/web-components.ts`
   - Implemented `defineOnce()` utility
   - Added polyfill loading guards

5. `refactor(ai): integrate all services with unified gemini-core`
   - Updated `src/lib/ai/gemini-service.ts`
   - Updated `src/lib/ai/stations/gemini-service.ts`
   - Updated `src/lib/drama-analyst/services/geminiService.ts`

6. `fix(stations): use safe text utilities for all string operations`
   - Updated Station 1, 2, 3, 5
   - Replaced `substring()` with `safeSub()`
   - Replaced `split()` with `safeSplit()`
   - Wrapped results with `toText()`

7. `fix(ui): prevent object rendering in station cards`
   - Updated `src/components/station-card.tsx`
   - Applied `toText()` to all displayed fields

---

## Support

For issues or questions:
1. Check browser console for specific error messages
2. Verify environment variables are set correctly
3. Ensure `pnpm install` has been run after pulling changes
4. Check that Gemini API key is valid and has quota

---

## References

- [Next.js 15 Turbopack Documentation](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Custom Elements Specification](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry)
- [Gemini API Documentation](https://ai.google.dev/docs)

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-09  
**Author**: AI Engineering Team
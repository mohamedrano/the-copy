# Quick Reference Card 🚀

## Core Imports

```typescript
import {
  throttleByModel,
  normalizeGenConfig,
  toText,
  safeSub,
  safeSplit,
  parseJsonLenient,
  MAX_TOKENS_PER_USE
} from '@/lib/ai/gemini-core';
```

---

## ✅ DO THIS

### API Calls
```typescript
// Apply throttling
await throttleByModel('gemini-2.5-flash');

// Use unified config
const config = normalizeGenConfig();
const result = await geminiService.generate({
  prompt: myPrompt,
  ...config
});
```

### Text Operations
```typescript
// Safe substring
const excerpt = safeSub(fullText, 0, 1000);

// Safe split
const lines = safeSplit(text, '\n');

// Safe text conversion
const safeText = toText(value);
```

### UI Rendering
```typescript
<p>{toText(data.field)}</p>
<span>{toText(data.nested?.field)}</span>
```

---

## ❌ DON'T DO THIS

```typescript
// ❌ Hardcoded token limits
maxOutputTokens: 8192

// ❌ Direct substring
fullText.substring(0, 1000)

// ❌ Direct split
text.split('\n')

// ❌ Direct rendering
<p>{data.field}</p>

// ❌ Missing throttling
await geminiService.generate(...)
```

---

## Constants

| Name | Value | Usage |
|------|-------|-------|
| `MAX_TOKENS_PER_USE` | 48192 | Token limit for all API calls |

---

## Throttling Delays

| Model | Delay |
|-------|-------|
| `gemini-2.5-flash-lite` | 6 seconds |
| `gemini-2.5-flash` | 10 seconds |
| `gemini-2.5-pro` | 15 seconds |

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-pro

# Development
ALLOWED_DEV_ORIGIN=https://your-workstation-url
```

---

## Common Patterns

### Adding a New Station
```typescript
import { throttleByModel, normalizeGenConfig, toText, safeSub } from '../gemini-core';

class MyStation extends BaseStation<Input, Output> {
  protected async process(input: Input): Promise<Output> {
    // 1. Throttle
    await throttleByModel('gemini-2.5-flash');
    
    // 2. Config
    const config = normalizeGenConfig();
    
    // 3. Safe text
    const context = safeSub(input.fullText, 0, 25000);
    
    // 4. Generate
    const result = await this.geminiService.generate({
      prompt: myPrompt,
      context,
      ...config
    });
    
    // 5. Safe usage
    const text = toText(result.content);
    
    return { /* ... */ };
  }
}
```

### Creating a UI Component
```typescript
import { toText } from '@/lib/ai/gemini-core';

export default function StationResult({ data }) {
  return (
    <div>
      <h2>{toText(data.title)}</h2>
      <p>{toText(data.description)}</p>
      {Array.isArray(data.items) ? (
        data.items.map(item => (
          <li key={item.id}>{toText(item.name)}</li>
        ))
      ) : (
        <p>{toText(data.items)}</p>
      )}
    </div>
  );
}
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Objects are not valid as a React child" | Wrap with `toText()` |
| "substring is not a function" | Use `safeSub()` |
| "split is not a function" | Use `safeSplit()` |
| "Webpack is configured while Turbopack is not" | Already fixed in config |
| Cross-origin warning | Set `ALLOWED_DEV_ORIGIN` |
| Font CSP error | Already fixed in config |

---

## Useful Commands

```bash
# Development
pnpm dev -p 9002

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build
pnpm build

# Clear cache
rm -rf .next
```

---

## Documentation

- Technical: `RUNTIME_UI_CONFIG_FIX.md`
- Arabic: `FIXES_SUMMARY_AR.md`
- Quick Start: `QUICK_START.md`
- Changes: `CHANGES_MANIFEST.md`

---

## Core Functions

### toText(value)
Converts any value to string, handles `{raw: string}` objects.

### safeSub(str, start, end?)
Safe substring operation with type checking.

### safeSplit(str, separator)
Safe split operation with type checking.

### throttleByModel(model)
Applies model-specific delay before API call.

### normalizeGenConfig()
Returns standard config with 48192 token limit.

### parseJsonLenient(text)
Attempts to parse JSON with multiple fallback strategies.

---

## Status Indicators

✅ = Implemented and working
❌ = Don't do this
⚠️ = Use with caution

---

**Version**: 1.0  
**Last Updated**: 2024-01-09
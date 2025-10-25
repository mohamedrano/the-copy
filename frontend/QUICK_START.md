# Quick Start Guide

## Getting Started After Pulling the Latest Changes

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Set Environment Variables
Create or update your `.env.local` file:

```bash
# Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-pro

# Development Origin (for Workstations environment)
# Replace with your actual Workstations URL
ALLOWED_DEV_ORIGIN=https://9002-firebase-the-copy--XXXX.cluster-....dev

# Optional: Force webpack instead of Turbopack (not recommended)
# FORCE_WEBPACK=1
```

### 3. Start Development Server
```bash
pnpm dev -p 9002
```

### 4. Verify Setup
Open your browser and check:
- [ ] No "Webpack is configured while Turbopack is not" warning
- [ ] No cross-origin warnings
- [ ] Hot reload works
- [ ] Console shows no CSP errors

---

## Running Full Analysis

### 1. Navigate to Analysis Page
```
http://localhost:9002/analysis/deep
```

### 2. Upload or Paste Text
- Click "اختر ملفاً" to upload a text file, OR
- Paste dramatic text directly into the text area

### 3. Start Analysis
Click "ابدأ التحليل" button

### 4. Monitor Progress
Watch the station cards update as each station completes:
- Station 1: Text Analysis
- Station 2: Conceptual Analysis
- Station 3: Network Builder
- Station 4: Efficiency Metrics
- Station 5: Dynamic/Symbolic Analysis
- Station 6: Diagnosis & Treatment
- Station 7: Final Report

### 5. Check Console Logs
You should see:
```
[Gemini Core] Throttling gemini-2.5-flash: waiting 10000ms
[Gemini Service] Generating content with model gemini-2.5-flash
  tokenLimit: 48192
  temperature: 0.2
```

---

## Key Changes to Be Aware Of

### 1. Unified Token Limits
All Gemini API calls now use **48,192 tokens** maximum:
```typescript
import { MAX_TOKENS_PER_USE } from '@/lib/ai/gemini-core';
// Always 48192
```

### 2. Model-Specific Throttling
Automatic delays between API calls:
- Flash Lite: 6 seconds
- Flash: 10 seconds
- Pro: 15 seconds

### 3. Safe Text Operations
Use these utilities instead of direct string methods:
```typescript
import { toText, safeSub, safeSplit } from '@/lib/ai/gemini-core';

// Instead of: value.substring(0, 100)
const result = safeSub(value, 0, 100);

// Instead of: value.split('\n')
const lines = safeSplit(value, '\n');

// For UI rendering:
<p>{toText(data.someField)}</p>
```

### 4. Lenient JSON Parsing
Gemini responses are now parsed leniently:
- If valid JSON: parsed and returned
- If plain text: wrapped in `{ raw: "..." }`
- If truncated: attempts repair before fallback

---

## Common Issues & Solutions

### Issue: Cross-Origin Warnings
**Symptom**: `allowedDevOrigins` warnings in console

**Solution**: Set the environment variable:
```bash
export ALLOWED_DEV_ORIGIN="https://your-workstation-url"
```

### Issue: Font CSP Errors
**Symptom**: Refused to load font from external source

**Solution**: Already fixed in config. Fonts from these sources are allowed:
- `fonts.gstatic.com`
- `r2cdn.perplexity.ai`

### Issue: "Objects are not valid as a React child"
**Symptom**: React error when displaying station results

**Solution**: Use `toText()` utility:
```typescript
import { toText } from '@/lib/ai/gemini-core';
<p>{toText(data.field)}</p>
```

### Issue: "substring is not a function"
**Symptom**: Error when processing text in stations

**Solution**: Use `safeSub()` utility:
```typescript
import { safeSub } from '@/lib/ai/gemini-core';
const excerpt = safeSub(fullText, 0, 1000);
```

### Issue: Pipeline Stops When Gemini Returns Plain Text
**Symptom**: Analysis fails partway through

**Solution**: Already fixed. Lenient JSON parsing continues with raw text fallback.

---

## Development Workflow

### Adding a New Station

1. **Import core utilities**:
```typescript
import {
  throttleByModel,
  normalizeGenConfig,
  toText,
  safeSub,
  MAX_TOKENS_PER_USE
} from '../gemini-core';
```

2. **Apply throttling before API calls**:
```typescript
await throttleByModel('gemini-2.5-flash');
```

3. **Use normalized config**:
```typescript
const config = normalizeGenConfig();
const result = await geminiService.generate({
  prompt: myPrompt,
  context: safeSub(fullText, 0, 25000),
  ...config
});
```

4. **Handle responses safely**:
```typescript
const text = toText(result.content);
const lines = safeSplit(text, '\n');
```

### Creating UI Components That Display Station Results

1. **Always import toText**:
```typescript
import { toText } from '@/lib/ai/gemini-core';
```

2. **Wrap all dynamic values**:
```typescript
<p>{toText(data.field)}</p>
<span>{toText(data.nested?.field)}</span>
```

3. **Handle arrays safely**:
```typescript
{Array.isArray(data.items) 
  ? data.items.map(item => <li key={item}>{toText(item)}</li>)
  : toText(data.items)}
```

---

## Testing Your Changes

### 1. Check Console Output
Look for these patterns:
```
✓ [Gemini Core] Throttling gemini-2.5-flash: waiting 10000ms
✓ [Gemini Service] Generating content with model gemini-2.5-flash
  tokenLimit: 48192
✓ [Gemini Service] ✅ Gemini API call successful
```

### 2. Verify No Errors
- [ ] No React child rendering errors
- [ ] No function call errors (substring, split, etc.)
- [ ] No CSP violations
- [ ] No webpack/turbopack warnings

### 3. Test Full Pipeline
- [ ] All 7 stations complete successfully
- [ ] Results display correctly in UI
- [ ] No crashes on non-JSON responses
- [ ] Throttling delays are respected

### 4. Check Output Files
If using text output mode, verify files are created:
```
frontend/analysis_output/
├── station1_text_analysis.txt
├── station2_conceptual_analysis.txt
├── station3_network_builder.txt
├── station4_efficiency_metrics.txt
├── station5_dynamic_symbolic.txt
├── station6_diagnosis_treatment.txt
├── station7_final_report.txt
└── visualizations.txt
```

---

## Useful Commands

### Development
```bash
# Start dev server with Turbopack (default)
pnpm dev -p 9002

# Force webpack mode (if needed)
FORCE_WEBPACK=1 pnpm dev -p 9002

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality
```bash
# Run linter
pnpm lint

# Run type check
pnpm type-check

# Run tests
pnpm test

# Format code
pnpm format
```

### Debugging
```bash
# Check diagnostics
pnpm tsc --noEmit

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Key Files Reference

### Core Module
- `src/lib/ai/gemini-core.ts` - Unified Gemini utilities

### Services
- `src/lib/ai/gemini-service.ts` - Main Gemini service
- `src/lib/ai/stations/gemini-service.ts` - Stations Gemini service
- `src/lib/drama-analyst/services/geminiService.ts` - Drama analyst service

### Stations
- `src/lib/ai/stations/station1-text-analysis.ts`
- `src/lib/ai/stations/station2-conceptual-analysis.ts`
- `src/lib/ai/stations/station3-network-builder.ts`
- `src/lib/ai/stations/station4-efficiency-metrics.ts`
- `src/lib/ai/stations/station5-dynamic-symbolic-stylistic.ts`
- `src/lib/ai/stations/station6-diagnosis-treatment.ts`
- `src/lib/ai/stations/station7-final-report.ts`

### Configuration
- `next.config.ts` - Next.js configuration
- `src/middleware.ts` - CSP middleware

### UI Components
- `src/components/station-card.tsx` - Station result display
- `src/components/stations-pipeline.tsx` - Pipeline orchestration

---

## Documentation

For detailed information, see:
- `RUNTIME_UI_CONFIG_FIX.md` - Complete technical documentation (English)
- `FIXES_SUMMARY_AR.md` - Summary in Arabic
- `FRONTEND_DOCUMENTATION.md` - General frontend documentation

---

## Need Help?

1. Check browser console for specific errors
2. Review the error resolution matrix in `RUNTIME_UI_CONFIG_FIX.md`
3. Ensure all environment variables are set correctly
4. Verify Gemini API key has sufficient quota
5. Check that you're using the correct model names

---

**Quick Reference Card**

```typescript
// ✅ DO THIS
import { toText, safeSub, throttleByModel, normalizeGenConfig } from '@/lib/ai/gemini-core';

await throttleByModel(model);
const config = normalizeGenConfig();
const text = safeSub(fullText, 0, 1000);
<p>{toText(data.field)}</p>

// ❌ NOT THIS
maxOutputTokens: 8192  // Wrong: use MAX_TOKENS_PER_USE
fullText.substring(0, 1000)  // Wrong: use safeSub()
<p>{data.field}</p>  // Wrong: use toText()
```

---

**Last Updated**: 2024-01-09  
**Version**: 1.0
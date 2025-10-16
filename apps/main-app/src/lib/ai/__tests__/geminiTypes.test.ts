import { describe, it, expect } from 'vitest'
import type { GenerateContentCandidate } from '@google/generative-ai'
import {
  hasCandidates,
  hasValidContent,
  isNetworkError,
  isSchemaError,
  isApiError,
  extractTextFromCandidates,
  safeRegexMatch,
  safeRegexMatchGroup,
} from '../geminiTypes'

describe('geminiTypes helpers', () => {
  const مرشحنصي: GenerateContentCandidate = {
    content: {
      parts: [{ text: 'مرحبا' }, { text: ' بالعالم' }],
      role: 'model',
    },
    index: 0,
  }

  it('يتحقق من وجود مرشحين صالحين ومحتوى نصي', () => {
    expect(hasCandidates({ candidates: [مرشحنصي] })).toBe(true)
    expect(hasCandidates({ candidates: [] })).toBe(false)
    expect(hasValidContent(مرشحنصي)).toBe(true)
    expect(
      hasValidContent({
        ...مرشحنصي,
        content: { parts: [], role: 'model' },
      } as GenerateContentCandidate)
    ).toBe(false)
  })

  it('يميز أنواع الأخطاء المختلفة', () => {
    expect(isNetworkError({ type: 'NETWORK_ERROR', message: 'timeout' })).toBe(true)
    expect(isSchemaError({ type: 'SCHEMA_MISMATCH', message: 'bad', expectedSchema: 'X', receivedData: {} })).toBe(true)
    expect(isApiError({ status: 500, message: 'failure' })).toBe(true)
    expect(isApiError({ status: '500', message: 'failure' })).toBe(false)
  })

  it('يستخرج النص من المرشح الأول ويعالج الحالات الحدية', () => {
    expect(extractTextFromCandidates([مرشحنصي])).toBe('مرحبا بالعالم')
    expect(extractTextFromCandidates([])).toBe('')
    expect(
      extractTextFromCandidates([
        {
          ...مرشحنصي,
          content: { parts: [{ text: undefined }], role: 'model' },
        } as GenerateContentCandidate,
      ])
    ).toBe('')
  })

  it('يوفر دوال regex آمنة للالتقاط', () => {
    const النص = 'المشهد [1] يبدأ هنا'
    expect(safeRegexMatch(النص, /\[1\]/)).toBe('[1]')
    expect(safeRegexMatch(النص, /غير موجود/)).toBeNull()
    expect(safeRegexMatchGroup(النص, /المشهد \[(\d+)\]/, 1)).toBe('1')
    expect(safeRegexMatchGroup(النص, /غير موجود/, 1)).toBeNull()
  })
})

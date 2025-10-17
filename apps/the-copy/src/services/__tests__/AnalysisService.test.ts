import { describe, it, expect, vi, beforeEach } from 'vitest'
import AnalysisService, { type AIWritingAssistantLike } from '../AnalysisService'
import type { Script, DialogueLine, Scene, Character } from '../../types/types'

const بناءسطرحوار = (
  id: string,
  character: string,
  text: string,
  lineNumber: number,
  sceneId: string
): DialogueLine => ({
  id,
  character,
  text,
  lineNumber,
  sceneId,
  type: 'dialogue',
})

const إنشاءمشهد = (
  id: string,
  heading: string,
  index: number,
  actionLines: Array<{ text: string; lineNumber: number }>,
  dialogues: DialogueLine[]
): Scene => ({
  id,
  heading,
  index,
  startLineNumber: actionLines[0]?.lineNumber ?? 1,
  endLineNumber: actionLines[actionLines.length - 1]?.lineNumber ?? actionLines[0]?.lineNumber ?? 1,
  lines: [],
  actionLines,
  dialogues,
})

const إنشاءشخصية = (
  name: string,
  dialogueLines: DialogueLine[],
  firstSceneId: string
): Character => ({
  name,
  dialogueCount: dialogueLines.length,
  dialogueLines,
  firstSceneId,
})

describe('AnalysisService', () => {
  let المولدالوهمي: AIWritingAssistantLike
  let الخدمة: AnalysisService
  const mockGenerate = vi.fn<AIWritingAssistantLike['generateText']>()

  const نصخام = '   المشهد الافتتاحي للقصة   '

  const مشهدأولحوارات: DialogueLine[] = [
    بناءسطرحوار('d1', 'أحمد', 'مرحباً', 2, 'scene-1'),
    بناءسطرحوار('d2', 'ليلى', 'أهلاً', 3, 'scene-1'),
  ]

  const مشهدثانيحوارات: DialogueLine[] = [
    بناءسطرحوار('d3', 'أحمد', 'نراك لاحقاً', 5, 'scene-2'),
  ]

  const المشاهد: Scene[] = [
    إنشاءمشهد('scene-1', 'المشهد الأول', 0, [
      { text: 'إضاءة خافتة على المسرح', lineNumber: 1 },
      { text: 'الكاميرا تتبع أحمد وهو يدخل.', lineNumber: 2 },
    ], مشهدأولحوارات),
    إنشاءمشهد('scene-2', 'المشهد الثاني', 1, [
      { text: 'لقطة مقرّبة لليلى وهي تفكر.', lineNumber: 4 },
    ], مشهدثانيحوارات),
  ]

  const شخصيات: Record<string, Character> = {
    أحمد: إنشاءشخصية('أحمد', [مشهدأولحوارات[0], مشهدثانيحوارات[0]], 'scene-1'),
    ليلى: إنشاءشخصية('ليلى', [مشهدأولحوارات[1]], 'scene-1'),
  }

  const النص: Script = {
    rawText: نصخام,
    totalLines: 6,
    scenes: المشاهد,
    characters: شخصيات,
    dialogueLines: [...مشهدأولحوارات, ...مشهدثانيحوارات],
  }

  beforeEach(() => {
    mockGenerate.mockReset()
    المولدالوهمي = { generateText: mockGenerate }
    الخدمة = new AnalysisService(المولدالوهمي)
  })

  it('يحسب المقاييس الأساسية ويعيد مخرجات الذكاء الاصطناعي', async () => {
    mockGenerate
      .mockResolvedValueOnce({ text: 'ملخص جذاب' })
      .mockResolvedValueOnce({ text: 'عنوان لافت' })

    const النتيجة = await الخدمة.analyze(النص)

    expect(mockGenerate).toHaveBeenCalledTimes(2)
    expect(mockGenerate).toHaveBeenCalledWith(
      'استنادًا إلى هذا السيناريو، قم بتوليد ملخص من فقرة واحدة (Synopsis).',
      نصخام.trim(),
      { mode: 'analysis' }
    )
    expect(mockGenerate).toHaveBeenLastCalledWith(
      'استنادًا إلى هذا السيناريو، اقترح عنوانًا جذابًا (Logline).',
      نصخام.trim(),
      { mode: 'analysis' }
    )

    expect(النتيجة.totalScenes).toBe(2)
    expect(النتيجة.dialogueToActionRatio).toBeCloseTo(1)
    expect(النتيجة.characterDialogueCounts).toEqual([
      { name: 'أحمد', dialogueLines: 2 },
      { name: 'ليلى', dialogueLines: 1 },
    ])
    expect(النتيجة.synopsis).toBe('ملخص جذاب')
    expect(النتيجة.logline).toBe('عنوان لافت')
  })

  it('يفضّل النص البديل عند توفيره ويعيد رسالة النقص عند غياب السياق', async () => {
    mockGenerate
      .mockResolvedValueOnce({ text: 'ملخص بديل' })
      .mockResolvedValueOnce({ text: 'عنوان بديل' })

    const النتيجة = await الخدمة.analyze({
      ...النص,
      rawText: '',
    }, '   نص بديل غني   ')

    expect(mockGenerate).toHaveBeenCalledWith(
      expect.any(String),
      'نص بديل غني',
      { mode: 'analysis' }
    )
    expect(النتيجة.synopsis).toBe('ملخص بديل')
    expect(النتيجة.logline).toBe('عنوان بديل')

    mockGenerate.mockReset()
    mockGenerate
      .mockResolvedValueOnce({ text: undefined })
      .mockResolvedValueOnce({ text: undefined })

    const بدونسياق = await الخدمة.analyze({
      ...النص,
      rawText: '',
      scenes: [],
      characters: {},
      dialogueLines: [],
    }, '')

    expect(بدونسياق.synopsis).toBe('لم يتم توفير نص كافٍ لتحليل الذكاء الاصطناعي.')
    expect(بدونسياق.logline).toBe('لم يتم توفير نص كافٍ لتحليل الذكاء الاصطناعي.')
  })

  it('يتعامل مع فشل خدمة الذكاء الاصطناعي ويعيد رسالة واضحة', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGenerate
      .mockRejectedValueOnce(new Error('تعذر الاتصال'))
      .mockResolvedValueOnce({ text: 'عنوان ثابت' })

    const النتيجة = await الخدمة.analyze(النص)

    expect(النتيجة.synopsis).toBe('حدث خطأ أثناء توليد الاستجابة من الذكاء الاصطناعي.')
    expect(النتيجة.logline).toBe('عنوان ثابت')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})

import { describe, it, expect } from 'vitest'
import { applyRegexReplacementToTextNodes } from '../domTextReplacement'

describe('applyRegexReplacementToTextNodes', () => {
  it('يستبدل أول تطابق فقط عند تعطيل الاستبدال الشامل', () => {
    const الجذر = document.createElement('div')
    الجذر.textContent = 'مرحبا بالعالم، مرحبا مرة أخرى'

    const عدد = applyRegexReplacementToTextNodes(الجذر, 'مرحبا', 'u', 'أهلاً', false)

    expect(عدد).toBe(1)
    expect(الجذر.textContent).toBe('أهلاً بالعالم، مرحبا مرة أخرى')
  })

  it('يعالج عقداً متداخلة ويستبدل جميع التطابقات', () => {
    const الجذر = document.createElement('section')
    const فقرة = document.createElement('p')
    const span = document.createElement('span')

    فقرة.append('المشهد الأول: ضوء خافت')
    span.append('المشهد الأول: حركة كاميرا')
    الجذر.append('المشهد الأول: مقدمة عامة', فقرة, span)

    const عدد = applyRegexReplacementToTextNodes(الجذر, 'المشهد الأول', 'gu', 'المشهد الافتتاحي', true)

    expect(عدد).toBe(3)
    expect(الجذر.textContent).toContain('المشهد الافتتاحي: مقدمة عامة')
    expect(فقرة.textContent).toBe('المشهد الافتتاحي: ضوء خافت')
    expect(span.textContent).toBe('المشهد الافتتاحي: حركة كاميرا')
  })

  it('يتجاهل العقد الفارغة ويعيد صفراً عند عدم وجود تطابق', () => {
    const الجذر = document.createElement('div')
    الجذر.append(document.createElement('span'))

    const عدد = applyRegexReplacementToTextNodes(الجذر, 'غير موجود', 'g', 'أي شيء', true)

    expect(عدد).toBe(0)
    expect(الجذر.textContent).toBe('')
  })

  it('يحدّث خاصية textContent عندما لا تتوفر nodeValue', () => {
    const عقدةافتراضية = {
      nodeType: 3,
      textContent: 'المشهد الثالث',
    }

    const جذرمخصص = {
      nodeType: 1,
      childNodes: [عقدةافتراضية],
    }

    const عدد = applyRegexReplacementToTextNodes(
      جذرمخصص as unknown as HTMLElement,
      'المشهد',
      '',
      'الفصل',
      true
    )

    expect(عدد).toBe(1)
    expect(عقدةافتراضية.textContent).toBe('الفصل الثالث')
  })
})

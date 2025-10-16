import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  sanitizeContentEditable,
  sanitizeUserInput,
  sanitizeFilename,
  generateCSPHeader,
} from '../sanitizer'

describe('sanitizer utilities', () => {
  it('ينظف HTML ويزيل الوسوم المحظورة', () => {
    const dirty = '<div><script>alert(1)</script><strong class="a">نص</strong></div>'
    const cleaned = sanitizeHTML(dirty)

    expect(cleaned).toContain('<strong class="a">نص</strong>')
    expect(cleaned).not.toContain('<script')
  })

  it('يحافظ على البنية المسموحة داخل contenteditable', () => {
    const dirty = '<div dir="rtl" onclick="evil()"><span>فقرة</span><script>bad()</script></div>'
    const cleaned = sanitizeContentEditable(dirty)

    expect(cleaned).toContain('dir="rtl"')
    expect(cleaned).toContain('<span>فقرة</span>')
    expect(cleaned).not.toContain('onclick')
    expect(cleaned).not.toContain('<script')
  })

  it('يزيل المحارف الخطرة من مدخل المستخدم ويقص الطول', () => {
    const dirty = '\u0000\u0008مرحبا\u001fنص طويل    '
    const cleaned = sanitizeUserInput(dirty)

    expect(cleaned).toBe('مرحبانص طويل')
    expect(sanitizeUserInput('')).toBe('')
    expect(sanitizeUserInput(123 as unknown as string)).toBe('')
  })

  it('ينتج أسماء ملفات آمنة دون محارف محجوزة', () => {
    expect(sanitizeFilename('  ..//script?.tsx  ')).toBe('script.tsx')
    expect(sanitizeFilename('')).toBe('untitled')
  })

  it('يبني ترويسة CSP موحدة', () => {
    const header = generateCSPHeader()
    expect(header).toContain("default-src 'self'")
    expect(header).toContain('connect-src')
    expect(header.split('; ').length).toBeGreaterThan(5)
  })
})

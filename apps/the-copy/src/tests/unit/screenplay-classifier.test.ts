/**
 * Unit tests for ScreenplayClassifier
 */

import { describe, it, expect } from 'vitest';
import { ScreenplayClassifier } from '../../components/editor/CleanIntegratedScreenplayEditor';

describe('ScreenplayClassifier', () => {
  describe('Arabic text processing', () => {
    it('should strip tashkeel from Arabic text', () => {
      const textWithTashkeel = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
      const expected = 'بسم الله الرحمن الرحيم';
      expect(ScreenplayClassifier.stripTashkeel(textWithTashkeel)).toBe(expected);
    });

    it('should normalize separators', () => {
      const text = 'النص—الأول، والنص–الثاني';
      const expected = 'النص-الأول, والنص-الثاني';
      expect(ScreenplayClassifier.normalizeSeparators(text)).toBe(expected);
    });

    it('should normalize complete line', () => {
      const input = '  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ  ';
      const expected = 'بسم الله الرحمن الرحيم';
      expect(ScreenplayClassifier.normalizeLine(input)).toBe(expected);
    });
  });

  describe('Line classification', () => {
    it('should identify Basmala', () => {
      expect(ScreenplayClassifier.isBasmala('بسم الله الرحمن الرحيم')).toBe(true);
      expect(ScreenplayClassifier.isBasmala('{بسم الله الرحمن الرحيم}')).toBe(true);
      expect(ScreenplayClassifier.isBasmala('نص عادي')).toBe(false);
    });

    it('should identify scene headers', () => {
      expect(ScreenplayClassifier.isSceneHeaderStart('مشهد 1')).toBe(true);
      expect(ScreenplayClassifier.isSceneHeaderStart('م. 2')).toBe(true);
      expect(ScreenplayClassifier.isSceneHeaderStart('نص عادي')).toBe(false);
    });

    it('should identify character lines', () => {
      expect(ScreenplayClassifier.isCharacterLine('أحمد:')).toBe(true);
      expect(ScreenplayClassifier.isCharacterLine('فاطمة')).toBe(true);
      expect(ScreenplayClassifier.isCharacterLine('هذا حوار طويل جداً')).toBe(false);
    });

    it('should identify parenthetical text', () => {
      expect(ScreenplayClassifier.isParenShaped('(بصوت منخفض)')).toBe(true);
      expect(ScreenplayClassifier.isParenShaped('نص عادي')).toBe(false);
    });
  });

  describe('Script structuring', () => {
    it('should structure a simple Arabic script', () => {
      const script = `بسم الله الرحمن الرحيم

مشهد 1

يدخل أحمد إلى الغرفة.

أحمد:
مرحباً، كيف حالك؟

فاطمة:
بخير، الحمد لله.`;

      const result = ScreenplayClassifier.prototype.structureScript(script);
      
      expect(result.scenes).toHaveLength(1);
      expect(result.scenes[0].heading).toBe('مشهد 1');
      expect(result.dialogueLines).toHaveLength(2);
      expect(result.characters['أحمد']).toBeDefined();
      expect(result.characters['فاطمة']).toBeDefined();
    });
  });

  describe('Utility functions', () => {
    it('should count words correctly', () => {
      expect(ScreenplayClassifier.wordCount('كلمة واحدة')).toBe(2);
      expect(ScreenplayClassifier.wordCount('')).toBe(0);
      expect(ScreenplayClassifier.wordCount('   ')).toBe(0);
    });

    it('should detect sentence punctuation', () => {
      expect(ScreenplayClassifier.hasSentencePunctuation('هذا سؤال؟')).toBe(true);
      expect(ScreenplayClassifier.hasSentencePunctuation('هذا تعجب!')).toBe(true);
      expect(ScreenplayClassifier.hasSentencePunctuation('هذا نص عادي')).toBe(false);
    });

    it('should detect blank lines', () => {
      expect(ScreenplayClassifier.isBlank('')).toBe(true);
      expect(ScreenplayClassifier.isBlank('   ')).toBe(true);
      expect(ScreenplayClassifier.isBlank('نص')).toBe(false);
    });
  });
});
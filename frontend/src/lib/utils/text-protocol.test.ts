import { describe, it, expect } from 'vitest';
import { encodeRecord, decodeRecord, toTextPayload, fromTextPayload } from './text-protocol';

describe('Text Protocol Utilities', () => {
  describe('encodeRecord', () => {
    it('should encode simple key-value pairs', () => {
      const input = { name: 'John', age: '30' };
      const result = encodeRecord(input);
      expect(result).toContain('name=John');
      expect(result).toContain('age=30');
    });

    it('should escape newlines in values', () => {
      const input = { message: 'Hello\nWorld' };
      const result = encodeRecord(input);
      expect(result).toBe('message=Hello\\nWorld');
    });

    it('should escape equals signs in values', () => {
      const input = { equation: '2+2=4' };
      const result = encodeRecord(input);
      expect(result).toBe('equation=2+2\\=4');
    });

    it('should escape backslashes in values', () => {
      const input = { path: 'C:\\Users\\John' };
      const result = encodeRecord(input);
      expect(result).toBe('path=C:\\\\Users\\\\John');
    });

    it('should escape carriage returns in values', () => {
      const input = { text: 'Line1\r\nLine2' };
      const result = encodeRecord(input);
      expect(result).toBe('text=Line1\\r\\nLine2');
    });

    it('should handle empty values', () => {
      const input = { empty: '' };
      const result = encodeRecord(input);
      expect(result).toBe('empty=');
    });

    it('should handle null and undefined values', () => {
      const input = { nullVal: null, undefinedVal: undefined };
      const result = encodeRecord(input);
      expect(result).toContain('nullVal=');
      expect(result).toContain('undefinedVal=');
    });

    it('should handle multiple special characters', () => {
      const input = { complex: 'a=b\nc=d\\e\rf' };
      const result = encodeRecord(input);
      expect(result).toBe('complex=a\\=b\\nc\\=d\\\\e\\rf');
    });
  });

  describe('decodeRecord', () => {
    it('should decode simple key-value pairs', () => {
      const input = 'name=John\nage=30';
      const result = decodeRecord(input);
      expect(result).toEqual({ name: 'John', age: '30' });
    });

    it('should unescape newlines in values', () => {
      const input = 'message=Hello\\nWorld';
      const result = decodeRecord(input);
      expect(result.message).toBe('Hello\nWorld');
    });

    it('should unescape equals signs in values', () => {
      const input = 'equation=2+2\\=4';
      const result = decodeRecord(input);
      expect(result.equation).toBe('2+2=4');
    });

    it('should unescape backslashes in values', () => {
      const input = 'path=C:\\\\Users\\\\John';
      const result = decodeRecord(input);
      expect(result.path).toBe('C:\\Users\\John');
    });

    it('should unescape carriage returns in values', () => {
      const input = 'text=Line1\\r\\nLine2';
      const result = decodeRecord(input);
      expect(result.text).toBe('Line1\r\nLine2');
    });

    it('should handle empty values', () => {
      const input = 'empty=';
      const result = decodeRecord(input);
      expect(result.empty).toBe('');
    });

    it('should handle empty input', () => {
      const input = '';
      const result = decodeRecord(input);
      expect(result).toEqual({});
    });

    it('should skip empty lines', () => {
      const input = 'name=John\n\nage=30';
      const result = decodeRecord(input);
      expect(result).toEqual({ name: 'John', age: '30' });
    });

    it('should handle multiple special characters', () => {
      const input = 'complex=a\\=b\\nc\\=d\\\\e\\rf';
      const result = decodeRecord(input);
      expect(result.complex).toBe('a=b\nc=d\\e\rf');
    });
  });

  describe('Round-trip encoding/decoding', () => {
    it('should correctly round-trip simple data', () => {
      const original = { name: 'Alice', city: 'Paris' };
      const encoded = encodeRecord(original);
      const decoded = decodeRecord(encoded);
      expect(decoded).toEqual(original);
    });

    it('should correctly round-trip data with newlines', () => {
      const original = { text: 'Line1\nLine2\nLine3' };
      const encoded = encodeRecord(original);
      const decoded = decodeRecord(encoded);
      expect(decoded).toEqual(original);
    });

    it('should correctly round-trip data with equals signs', () => {
      const original = { formula: 'x=y+z' };
      const encoded = encodeRecord(original);
      const decoded = decodeRecord(encoded);
      expect(decoded).toEqual(original);
    });

    it('should correctly round-trip data with backslashes', () => {
      const original = { path: 'C:\\Program Files\\App' };
      const encoded = encodeRecord(original);
      const decoded = decodeRecord(encoded);
      expect(decoded).toEqual(original);
    });

    it('should correctly round-trip complex data', () => {
      const original = {
        name: 'Test\nUser',
        equation: 'a=b\\c',
        path: 'C:\\Users\\Test',
        multiline: 'Line1\r\nLine2\r\nLine3'
      };
      const encoded = encodeRecord(original);
      const decoded = decodeRecord(encoded);
      expect(decoded).toEqual(original);
    });
  });

  describe('toTextPayload and fromTextPayload', () => {
    it('should work as aliases for encode/decode', () => {
      const original = { key: 'value\nwith\nnewlines' };
      const payload = toTextPayload(original);
      const restored = fromTextPayload(payload);
      expect(restored).toEqual(original);
    });
  });
});

/// <reference types="vitest/globals" />
import { encodeRecord, decodeRecord } from '../kv-utils';

describe('encodeRecord', () => {
  it('should encode simple object', () => {
    const obj = { a: '1', b: '2' };
    const result = encodeRecord(obj);
    expect(result).toBe('a=1\nb=2');
  });

  it('should encode nested object', () => {
    const obj = { a: { b: '1' } };
    const result = encodeRecord(obj);
    expect(result).toBe('a.b=1');
  });

  it('should escape special characters', () => {
    const obj = { a: 'hello\nworld=\\test' };
    const result = encodeRecord(obj);
    expect(result).toBe('a=hello\\nworld\\=\\\\test');
  });

  it('should handle empty object', () => {
    const obj = {};
    const result = encodeRecord(obj);
    expect(result).toBe('');
  });

  it('should handle primitive types', () => {
    const obj = { a: 1, b: true, c: null };
    const result = encodeRecord(obj);
    expect(result).toBe('a=1\nb=true\nc=null');
  });
});

describe('decodeRecord', () => {
  it('should decode simple record', () => {
    const text = 'a=1\nb=2';
    const result = decodeRecord(text);
    expect(result).toEqual({ a: '1', b: '2' });
  });

  it('should decode nested keys', () => {
    const text = 'a.b=1';
    const result = decodeRecord(text);
    expect(result).toEqual({ 'a.b': '1' });
  });

  it('should unescape special characters', () => {
    const text = 'a=hello\\nworld\\=\\\\test';
    const result = decodeRecord(text);
    expect(result).toEqual({ a: 'hello\nworld=\\test' });
  });

  it('should handle empty text', () => {
    const text = '';
    const result = decodeRecord(text);
    expect(result).toEqual({});
  });

  it('should skip lines without =', () => {
    const text = 'a=1\ninvalid\nb=2';
    const result = decodeRecord(text);
    expect(result).toEqual({ a: '1', b: '2' });
  });

  it('should handle multiple escapes', () => {
    const text = 'a=\\\\\\n\\r\\=';
    const result = decodeRecord(text);
    expect(result).toEqual({ a: '\\\n\r=' });
  });
});
/**
 * Text-Based Key-Value Protocol Utilities
 *
 * Provides encoding and decoding functions for structured data transmission
 * using a line-oriented text format instead of binary or structured formats.
 *
 * Protocol Format:
 * - Each record is represented as lines of key=value pairs
 * - Special characters within values are escaped:
 *   - Newlines → \\n
 *   - Equals signs → \\=
 *   - Backslashes → \\\\
 * - Empty lines separate multiple records (if needed)
 *
 * Example:
 * ```
 * name=John Doe
 * message=Hello\\nWorld
 * status=active
 * ```
 */

/**
 * Encodes a record object into text-based key=value format
 * @param obj - The record to encode
 * @returns Text representation of the record
 */
export function encodeRecord(obj: Record<string, unknown>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    // Convert value to string
    let valueStr = '';

    if (value === null || value === undefined) {
      valueStr = '';
    } else if (typeof value === 'object') {
      // For nested objects, serialize them as text first
      valueStr = encodeRecord(value as Record<string, unknown>);
    } else {
      valueStr = String(value);
    }

    // Escape special characters
    const escapedValue = valueStr
      .replace(/\\/g, '\\\\')   // Escape backslashes first
      .replace(/\n/g, '\\n')    // Escape newlines
      .replace(/\r/g, '\\r')    // Escape carriage returns
      .replace(/=/g, '\\=');    // Escape equals signs

    lines.push(`${key}=${escapedValue}`);
  }

  return lines.join('\n');
}

/**
 * Decodes text-based key=value format into a record object
 * @param text - The text to decode
 * @returns Decoded record object
 */
export function decodeRecord(text: string): Record<string, string> {
  const record: Record<string, string> = {};

  if (!text || text.trim() === '') {
    return record;
  }

  const lines = text.split('\n');

  for (const line of lines) {
    if (line.trim() === '') continue;

    // Find the first unescaped equals sign
    let equalsIndex = -1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '=' && (i === 0 || line[i - 1] !== '\\')) {
        equalsIndex = i;
        break;
      }
    }

    if (equalsIndex === -1) continue;

    const key = line.substring(0, equalsIndex);
    const escapedValue = line.substring(equalsIndex + 1);

    // Unescape special characters
    const value = escapedValue
      .replace(/\\=/g, '=')     // Unescape equals signs
      .replace(/\\r/g, '\r')    // Unescape carriage returns
      .replace(/\\n/g, '\n')    // Unescape newlines
      .replace(/\\\\/g, '\\');  // Unescape backslashes last

    record[key] = value;
  }

  return record;
}

/**
 * Converts a record to a text payload for transmission
 * @param obj - The record to convert
 * @returns Text payload string
 */
export function toTextPayload(obj: Record<string, unknown>): string {
  return encodeRecord(obj);
}

/**
 * Converts a text payload back to a record object
 * @param text - The text payload
 * @returns Decoded record object
 */
export function fromTextPayload(text: string): Record<string, string> {
  return decodeRecord(text);
}
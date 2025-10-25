export function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

export function unflatten(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current: any = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part && !current[part]) current[part] = {};
      if (part) current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart) current[lastPart] = value;
  }

  return result;
}

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/=/g, '\\=');
}

function unescapeValue(value: string): string {
  return value.replace(/\\=/g, '=').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\\/g, '\\');
}

export function encodeRecord(obj: Record<string, any>): string {
  const flat = flatten(obj);
  const lines = Object.entries(flat).map(([key, value]) => `${key}=${escapeValue(value)}`);
  return lines.join('\n');
}

export function decodeRecord(text: string): Record<string, string> {
  const lines = text.split('\n').filter(line => line.trim());
  const result: Record<string, string> = {};

  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx);
    const value = unescapeValue(line.slice(idx + 1));
    result[key] = value;
  }

  return result;
}
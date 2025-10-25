/**
 * Unified Gemini Core Module
 *
 * This module provides centralized configuration, token limits, and throttling
 * for all Gemini API interactions across the application.
 *
 * Key Features:
 * - Unified token limit of 48,192 tokens per use
 * - Model-specific throttling (6s/10s/15s based on model)
 * - Lenient JSON parsing with fallback to raw text
 * - Text normalization utilities
 */

export type ModelId =
  | "gemini-2.0-flash-lite"
  | "gemini-2.0-flash-001"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-exp";

/**
 * Unified maximum tokens per API call across all usages
 */
export const MAX_TOKENS_PER_USE = 48192 as const;

/**
 * Model-specific delay requirements in milliseconds
 * - Flash Lite: 6 seconds between requests
 * - Flash: 10 seconds between requests
 * - Pro: 15 seconds between requests
 */
const MODEL_DELAYS_MS: Record<string, number> = {
  "gemini-2.5-flash-lite": 6000,
  "gemini-2.0-flash-lite": 6000,
  "gemini-2.5-flash": 10000,
  "gemini-2.0-flash-001": 10000,
  "gemini-2.0-flash-exp": 10000,
  "gemini-2.5-pro": 15000,
};

/**
 * Tracks the last call timestamp for each model to enforce throttling
 */
const lastCallAt: Partial<Record<string, number>> = {};

/**
 * Throttles API calls by model to respect rate limits
 *
 * @param model - The model ID to throttle
 * @returns Promise that resolves after the required delay
 */
export async function throttleByModel(model: ModelId | string): Promise<void> {
  const now = Date.now();
  const delay: number =
    MODEL_DELAYS_MS[model] || MODEL_DELAYS_MS["gemini-2.0-flash-001"] || 10000;
  const last = lastCallAt[model] ?? 0;
  const wait = Math.max(0, delay - (now - last));

  if (wait > 0) {
    console.log(`[Gemini Core] Throttling ${model}: waiting ${wait}ms`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  lastCallAt[model] = Date.now();
}

/**
 * Returns normalized generation configuration with unified token limits
 *
 * @returns Standard generation config object
 */
export function normalizeGenConfig(): {
  maxOutputTokens: number;
  temperature: number;
  topK: number;
  topP: number;
} {
  return {
    maxOutputTokens: MAX_TOKENS_PER_USE,
    temperature: 0.2,
    topK: 40,
    topP: 0.9,
  };
}

/**
 * Attempts to extract JSON from potentially mixed-format text
 *
 * This function is for internal processing only and should NOT be used
 * to display JSON to end users.
 *
 * @param raw - Raw text that may contain JSON
 * @returns Parsed JSON object or null if parsing fails
 */
export function parseJsonLenient(raw: string): any | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  // 1) Direct JSON parse attempt
  try {
    return JSON.parse(raw.trim());
  } catch {
    // Continue to next strategy
  }

  // 2) Try to extract from ```json ... ``` code blocks
  const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {
      // Continue to next strategy
    }
  }

  // 3) Try to extract any JSON-like structure
  const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Continue to next strategy
    }
  }

  // 4) Try to repair truncated JSON
  const repairedJson = repairTruncatedJson(raw);
  if (repairedJson) {
    try {
      return JSON.parse(repairedJson);
    } catch {
      // All strategies failed
    }
  }

  return null;
}

/**
 * Attempts to repair truncated JSON by finding the last valid closing bracket
 *
 * @param payload - Potentially truncated JSON string
 * @returns Repaired JSON string or undefined if repair is not possible
 */
function repairTruncatedJson(payload: string): string | undefined {
  if (!payload || typeof payload !== "string") {
    return undefined;
  }

  const lastObject = payload.lastIndexOf("}");
  const lastArray = payload.lastIndexOf("]");
  const lastIndex = Math.max(lastObject, lastArray);

  if (lastIndex === -1) {
    return undefined;
  }

  return payload.slice(0, lastIndex + 1);
}

/**
 * Safely converts any value to a string, handling objects with 'raw' property
 *
 * This utility prevents "Objects are not valid as a React child" errors
 * by ensuring all values are properly converted to strings before rendering.
 *
 * @param v - Value to convert to text
 * @returns String representation of the value
 */
export function toText(v: unknown): string {
  if (typeof v === "string") {
    return v;
  }

  if (v && typeof v === "object" && "raw" in v) {
    const rawValue = (v as any).raw;
    if (typeof rawValue === "string") {
      return rawValue;
    }
  }

  if (v === null || v === undefined) {
    return "";
  }

  return String(v);
}

/**
 * Safely performs substring operation with type checking
 *
 * @param s - Value to substring
 * @param start - Start index
 * @param end - Optional end index
 * @returns Substring or empty string if input is not a string
 */
export function safeSub(s: unknown, start: number, end?: number): string {
  const text = toText(s);
  return text.substring(start, end);
}

/**
 * Safely splits a string with type checking
 *
 * @param s - Value to split
 * @param separator - Separator string or regex
 * @returns Array of substrings or empty array if input is not a string
 */
export function safeSplit(s: unknown, separator: string | RegExp): string[] {
  const text = toText(s);
  return text ? text.split(separator) : [];
}

/**
 * Validates if a value is structured JSON (object or array)
 *
 * @param value - Value to check
 * @returns True if value is an object or array
 */
export function isStructuredJson(
  value: unknown
): value is Record<string, unknown> | unknown[] {
  if (Array.isArray(value)) {
    return true;
  }

  return typeof value === "object" && value !== null;
}

/**
 * Creates a fallback response with raw text when JSON parsing fails
 *
 * @param responseText - Raw response text
 * @returns Object with raw property containing the text
 */
export function buildRawFallback<T = any>(responseText: string): T {
  return { raw: responseText } as unknown as T;
}

/**
 * Sanitizes partial payloads by filtering out undefined/null values
 *
 * @param value - Value to sanitize
 * @returns Sanitized object/array or undefined if not structured
 */
export function sanitizePartialPayload(
  value: unknown
): Record<string, unknown> | unknown[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null);
  }

  if (isStructuredJson(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(
        ([, itemValue]) => itemValue !== undefined && itemValue !== null
      )
    );
  }

  return undefined;
}

/**
 * Gets the appropriate delay for a given model
 *
 * @param model - Model ID
 * @returns Delay in milliseconds
 */
export function getModelDelay(model: ModelId | string): number {
  return (
    MODEL_DELAYS_MS[model] || MODEL_DELAYS_MS["gemini-2.0-flash-001"] || 10000
  );
}

/**
 * Resets throttling state for a specific model or all models
 * Useful for testing or manual override scenarios
 *
 * @param model - Optional model ID. If not provided, resets all models
 */
export function resetThrottle(model?: ModelId | string): void {
  if (model) {
    delete lastCallAt[model];
  } else {
    Object.keys(lastCallAt).forEach((key) => delete lastCallAt[key]);
  }
}

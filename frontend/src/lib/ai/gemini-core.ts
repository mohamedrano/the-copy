/**
 * Unified Gemini AI Core Layer
 *
 * This module provides a unified interface for all Gemini AI interactions across the application.
 * It enforces consistent token limits (48192), per-model rate limiting, and safe text handling.
 *
 * Features:
 * - Unified token limit: 48192 for all models
 * - Per-model rate limiting: Flash-Lite (6s), Flash (10s), Pro (15s)
 * - Safe text utilities to prevent React rendering errors
 * - Lax JSON parsing that doesn't throw errors
 * - No JSON exposed to user interface
 */

import { GoogleGenAI } from '@google/genai';

// =====================================================
// Type Definitions
// =====================================================

export type GeminiModelType = 'flash-lite' | 'flash' | 'pro';

export interface CallGeminiOptions {
  model: GeminiModelType;
  input: string;
  maxTokens?: number;
  temperature?: number;
  systemInstruction?: string;
  responseType?: 'text' | 'json-lax';
}

export interface GeminiResponse {
  text: string;
  data?: any;
  metadata: {
    model: string;
    timestamp: string;
    tokensUsed?: number;
  };
}

// =====================================================
// Configuration
// =====================================================

const MODEL_MAP: Record<GeminiModelType, string> = {
  'flash-lite': 'gemini-2.5-flash-lite',
  'flash': 'gemini-2.5-flash',
  'pro': 'gemini-2.5-pro',
};

const MODEL_DELAYS: Record<GeminiModelType, number> = {
  'flash-lite': 6000,  // 6 seconds
  'flash': 10000,      // 10 seconds
  'pro': 15000,        // 15 seconds
};

const UNIFIED_TOKEN_LIMIT = 48192;

// Track last call time per model for rate limiting
const lastCallTime: Record<GeminiModelType, number> = {
  'flash-lite': 0,
  'flash': 0,
  'pro': 0,
};

// =====================================================
// Safe Text Utilities
// =====================================================

/**
 * Safely converts any value to text string
 * Returns empty string for objects, arrays, undefined, null
 * This prevents React "Objects are not valid as a React child" errors
 */
export function toText(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // For objects with 'raw' property (common in AI responses)
  if (typeof value === 'object' && value.raw !== undefined) {
    return toText(value.raw);
  }

  // For arrays and other objects, return empty string
  // This prevents rendering issues in React
  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

/**
 * Safe substring operation - only works on strings
 * Returns empty string if input is not a string
 */
export function safeSub(value: any, start: number, length?: number): string {
  const text = toText(value);
  if (!text) return '';

  if (length !== undefined) {
    return text.substring(start, start + length);
  }
  return text.substring(start);
}

/**
 * Safe split operation - only works on strings
 * Returns empty array if input is not a string
 */
export function safeSplit(value: any, separator: string | RegExp): string[] {
  const text = toText(value);
  if (!text) return [];

  return text.split(separator);
}

// =====================================================
// JSON Utilities
// =====================================================

/**
 * Lax JSON parser that doesn't throw errors
 * Attempts to parse JSON, returns raw text on failure
 * Never exposes raw JSON to UI
 */
function parseJsonLax(text: string): any {
  try {
    // Try direct JSON parse
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        // Fall through
      }
    }

    // Try to find JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch && objectMatch[0]) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (e3) {
        // Fall through
      }
    }

    // Return original text if all parsing attempts fail
    return { raw: text };
  }
}

// =====================================================
// Rate Limiting
// =====================================================

/**
 * Enforces rate limiting delay before API call
 */
async function enforceRateLimit(modelType: GeminiModelType): Promise<void> {
  const now = Date.now();
  const lastCall = lastCallTime[modelType];
  const requiredDelay = MODEL_DELAYS[modelType];
  const timeSinceLastCall = now - lastCall;

  if (timeSinceLastCall < requiredDelay) {
    const waitTime = requiredDelay - timeSinceLastCall;
    await delay(waitTime);
  }

  lastCallTime[modelType] = Date.now();
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =====================================================
// Core API
// =====================================================

let genAI: GoogleGenAI | null = null;

/**
 * Initialize Google Generative AI client
 */
function initializeClient(): GoogleGenAI {
  if (genAI) return genAI;

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }

  genAI = new GoogleGenAI({ apiKey });
  return genAI;
}

/**
 * Unified Gemini API call interface
 *
 * All Gemini calls in the application should go through this function.
 *
 * @param options - Configuration options
 * @returns Response with text and optional parsed data
 *
 * @example
 * const result = await callGemini({
 *   model: 'flash',
 *   input: 'Analyze this text...',
 *   responseType: 'text'
 * });
 * console.log(result.text); // Safe to render in UI
 */
export async function callGemini(options: CallGeminiOptions): Promise<GeminiResponse> {
  const {
    model,
    input,
    maxTokens = UNIFIED_TOKEN_LIMIT,
    temperature = 0.9,
    systemInstruction,
    responseType = 'text',
  } = options;

  // Enforce rate limiting
  await enforceRateLimit(model);

  // Initialize client
  const client = initializeClient();

  // Get model name
  const modelName = MODEL_MAP[model];

  // Build prompt with system instruction
  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n${input}`
    : input;

  // Generate content
  const result = await client.models.generateContent({
    model: modelName,
    contents: fullPrompt,
    config: {
      temperature,
      maxOutputTokens: UNIFIED_TOKEN_LIMIT, // Always use unified limit
    },
  });

  const text = result.text || '';

  // Parse response based on type
  let data: any = undefined;
  if (responseType === 'json-lax') {
    data = parseJsonLax(text);
  }

  return {
    text: toText(text), // Always return safe text
    data,
    metadata: {
      model: modelName,
      timestamp: new Date().toISOString(),
    },
  };
}

// =====================================================
// Convenience Functions
// =====================================================

/**
 * Call Gemini Flash-Lite model (6s delay)
 */
export async function callFlashLite(
  input: string,
  options?: Partial<Omit<CallGeminiOptions, 'model' | 'input'>>
): Promise<GeminiResponse> {
  return callGemini({ model: 'flash-lite', input, ...options });
}

/**
 * Call Gemini Flash model (10s delay)
 */
export async function callFlash(
  input: string,
  options?: Partial<Omit<CallGeminiOptions, 'model' | 'input'>>
): Promise<GeminiResponse> {
  return callGemini({ model: 'flash', input, ...options });
}

/**
 * Call Gemini Pro model (15s delay)
 */
export async function callPro(
  input: string,
  options?: Partial<Omit<CallGeminiOptions, 'model' | 'input'>>
): Promise<GeminiResponse> {
  return callGemini({ model: 'pro', input, ...options });
}

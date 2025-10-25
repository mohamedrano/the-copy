/**
 * Unified Gemini AI Core Layer - Text Only
 *
 * This module provides a unified TEXT-ONLY interface for all Gemini AI interactions.
 * NO JSON parsing. NO JSON output to UI. Pure text in, pure text out.
 *
 * Features:
 * - Unified token limit: 48192 for all models
 * - Per-model throttling: Flash-Lite (6s), Flash (10s), Pro (15s)
 * - Safe text utilities to prevent React rendering errors
 * - Text-only responses
 */

import { GoogleGenAI } from "@google/genai";

// =====================================================
// Type Definitions
// =====================================================

export type ModelId =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.5-pro";

export const MAX_TOKENS = 48192 as const;

// =====================================================
// Configuration
// =====================================================

const DELAY: Record<ModelId, number> = {
  "gemini-2.5-flash-lite": 6000, // 6 seconds
  "gemini-2.5-flash": 10000, // 10 seconds
  "gemini-2.5-pro": 15000, // 15 seconds
};

// Track last call time per model for throttling
const last: Partial<Record<ModelId, number>> = {};

// =====================================================
// Throttling
// =====================================================

/**
 * Enforces throttling delay before API call
 */
export async function throttle(model: ModelId): Promise<void> {
  const now = Date.now();
  const prev = last[model] ?? 0;
  const wait = Math.max(0, DELAY[model] - (now - prev));

  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }

  last[model] = Date.now();
}

// =====================================================
// Safe Text Utilities
// =====================================================

/**
 * Safely converts any value to text string
 * Handles objects with 'raw' property (common in AI responses)
 * Returns empty string for null/undefined
 */
export function toText(v: unknown): string {
  if (v === null || v === undefined) {
    return "";
  }

  if (typeof v === "string") {
    return v;
  }

  // Handle objects with 'raw' property
  if (
    v &&
    typeof v === "object" &&
    "raw" in (v as any) &&
    typeof (v as any).raw === "string"
  ) {
    return (v as any).raw;
  }

  // For numbers and booleans
  if (typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }

  // For arrays and other objects, return empty string
  return "";
}

/**
 * Safe substring - only works on strings
 */
export function safeSub(s: unknown, a: number, b?: number): string {
  const text = toText(s);
  if (!text) return "";
  return b !== undefined ? text.substring(a, b) : text.substring(a);
}

/**
 * Safe split - only works on strings
 */
export function safeSplit(s: unknown, sep: string | RegExp): string[] {
  const text = toText(s);
  if (!text) return [];
  return text.split(sep);
}

// =====================================================
// Core API - Text Only
// =====================================================

let genAI: GoogleGenAI | null = null;

/**
 * Initialize Google Generative AI client
 */
function initClient(): GoogleGenAI {
  if (genAI) return genAI;

  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("Gemini API key not found");
  }

  genAI = new GoogleGenAI({ apiKey });
  return genAI;
}

export type CallOpts = {
  model: ModelId;
  prompt: string;
  temperature?: number;
  systemInstruction?: string;
};

/**
 * Unified Gemini TEXT-ONLY call
 *
 * @returns Pure text string. NO JSON.
 *
 * @example
 * const text = await callGeminiText({
 *   model: 'gemini-2.5-flash',
 *   prompt: 'Analyze this...',
 *   temperature: 0.3
 * });
 */
export async function callGeminiText(opts: CallOpts): Promise<string> {
  const { model, prompt, temperature = 0.3, systemInstruction } = opts;

  // Enforce throttling
  await throttle(model);

  // Initialize client
  const client = initClient();

  // Build full prompt
  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  // Call API
  const result = await client.models.generateContent({
    model,
    contents: fullPrompt,
    config: {
      temperature,
      maxOutputTokens: MAX_TOKENS,
    },
  });

  // Extract text
  const output = result?.text ?? result?.content ?? result ?? "";

  // Convert to safe text and return
  return toText(output);
}

// =====================================================
// Convenience Functions
// =====================================================

/**
 * Call Flash-Lite (6s throttle)
 */
export async function callFlashLite(
  prompt: string,
  opts?: { temperature?: number; systemInstruction?: string }
): Promise<string> {
  return callGeminiText({
    model: "gemini-2.5-flash-lite",
    prompt,
    ...opts,
  });
}

/**
 * Call Flash (10s throttle)
 */
export async function callFlash(
  prompt: string,
  opts?: { temperature?: number; systemInstruction?: string }
): Promise<string> {
  return callGeminiText({
    model: "gemini-2.5-flash",
    prompt,
    ...opts,
  });
}

/**
 * Call Pro (15s throttle)
 */
export async function callPro(
  prompt: string,
  opts?: { temperature?: number; systemInstruction?: string }
): Promise<string> {
  return callGeminiText({
    model: "gemini-2.5-pro",
    prompt,
    ...opts,
  });
}

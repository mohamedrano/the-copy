/**
 * @file Strict TypeScript types for Gemini API integration
 * Provides comprehensive type safety for requests, responses, and error handling
 */

import type { GenerateContentCandidate, FinishReason } from "@google/generative-ai";

/**
 * Represents the structure of a successful Gemini API response
 */
export interface GeminiSuccessResponse {
  candidates: GenerateContentCandidate[];
  finishReason?: FinishReason;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

/**
 * Represents different types of API errors that can occur
 */
export interface GeminiApiError {
  status: number;
  message: string;
  code?: string;
  details?: Array<{
    "@type": string;
    reason?: string;
    domain?: string;
    metadata?: Record<string, string>;
  }>;
}

/**
 * Network-level errors (timeouts, connection issues)
 */
export interface GeminiNetworkError {
  type: 'NETWORK_ERROR';
  message: string;
  originalError?: Error;
}

/**
 * Schema validation errors when response doesn't match expected format
 */
export interface GeminiSchemaError {
  type: 'SCHEMA_MISMATCH';
  message: string;
  expectedSchema: string;
  receivedData: unknown;
}

/**
 * Union type for all possible error scenarios
 */
export type GeminiError = GeminiApiError | GeminiNetworkError | GeminiSchemaError;

/**
 * Enhanced response type with strict error handling
 */
export interface GeminiServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: GeminiError;
  metadata?: {
    tokensUsed?: number;
    finishReason?: FinishReason;
    processingTime?: number;
  };
}

/**
 * Determines whether a Gemini API response includes at least one candidate.
 *
 * @param response - Raw response object returned by the Gemini SDK.
 * @returns True when the response contains an array of candidate entries.
 */
export function hasCandidates(response: any): response is { candidates: GenerateContentCandidate[] } {
  return response &&
         Array.isArray(response.candidates) &&
         response.candidates.length > 0;
}

/**
 * Verifies that a candidate payload exposes at least one content part.
 *
 * @param candidate - Candidate entry emitted from the Gemini API.
 * @returns True when the candidate includes non-empty content parts.
 */
export function hasValidContent(candidate: GenerateContentCandidate): boolean {
  return candidate &&
         candidate.content &&
         candidate.content.parts &&
         Array.isArray(candidate.content.parts) &&
         candidate.content.parts.length > 0;
}

/**
 * Determines whether a thrown error originated from network conditions.
 *
 * @param error - The error value thrown by the Gemini client.
 * @returns True when the payload conforms to {@link GeminiNetworkError}.
 */
export function isNetworkError(error: any): error is GeminiNetworkError {
  return error && error.type === 'NETWORK_ERROR';
}

/**
 * Checks if the provided error describes a schema mismatch scenario.
 *
 * @param error - The error object raised by the integration layer.
 * @returns True when the error matches the {@link GeminiSchemaError} shape.
 */
export function isSchemaError(error: any): error is GeminiSchemaError {
  return error && error.type === 'SCHEMA_MISMATCH';
}

/**
 * Detects whether an error came directly from the Gemini REST API surface.
 *
 * @param error - Error response returned by the HTTP client.
 * @returns True when a numeric status and message are present.
 */
export function isApiError(error: any): error is GeminiApiError {
  return error && typeof error.status === 'number' && typeof error.message === 'string';
}

/**
 * Collects textual content from the first Gemini candidate in the list.
 *
 * @param candidates - Ordered candidate list returned by the API.
 * @returns Concatenated text extracted from all text parts of the first candidate.
 */
export function extractTextFromCandidates(candidates: GenerateContentCandidate[]): string {
  if (!candidates || candidates.length === 0) {
    return '';
  }

  const firstCandidate = candidates[0];
  if (!hasValidContent(firstCandidate)) {
    return '';
  }

  const textParts = firstCandidate.content.parts
    .filter(part => part.text !== undefined)
    .map(part => part.text);

  return textParts.join('');
}

/**
 * Executes {@link String.match} safely by returning {@code null} when no match
 * is found.
 *
 * @param text - Source text to run the regular expression against.
 * @param regex - Compiled regular expression instance.
 * @returns The matched substring or {@code null} if no match occurs.
 */
export function safeRegexMatch(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  return match ? match[0] : null;
}

/**
 * Retrieves a specific capture group from the first regex match or returns null
 * when the match or group is absent.
 *
 * @param text - Source string evaluated by the regex.
 * @param regex - Compiled regular expression to execute.
 * @param groupIndex - Index of the desired capture group, defaulting to {@code 1}.
 * @returns The capture group contents when present, otherwise {@code null}.
 */
export function safeRegexMatchGroup(text: string, regex: RegExp, groupIndex: number = 1): string | null {
  const match = text.match(regex);
  return match && match[groupIndex] ? match[groupIndex] : null;
}
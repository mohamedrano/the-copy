// src/config/environment.ts

/**
 * Defines the structure of the environment configuration.
 */
export interface EnvironmentConfig {
  geminiApiKey: string;
}

/**
 * Retrieves the Gemini API key from environment variables.
 * 
 * @throws {Error} If the GEMINI_API_KEY is not set in the environment variables.
 * @returns {string} The Gemini API key.
 */
const getGeminiApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables.');
  }
  return apiKey;
};

/**
 * The environment configuration object.
 */
export const environment: EnvironmentConfig = {
  geminiApiKey: getGeminiApiKey(),
};
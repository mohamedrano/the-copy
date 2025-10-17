import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export class GeminiService {
  private model: GenerativeModel;
  private config: GeminiConfig;

  constructor(config: GeminiConfig = {}) {
    this.config = {
      model: config.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      temperature: config.temperature || 0.9,
      maxOutputTokens: config.maxOutputTokens || 8192,
      topP: config.topP || 0.95,
      topK: config.topK || 40,
    };

    this.model = genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      },
    });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStructuredContent<T>(prompt: string, schema?: any): Promise<T> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, return the text as is
      return text as unknown as T;
    } catch (error) {
      console.error('Gemini Structured Generation Error:', error);
      throw new Error(`Failed to generate structured content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      // Format messages for Gemini
      const formattedMessages = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = this.model.startChat({
        history: formattedMessages.slice(0, -1),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      throw new Error(`Failed to chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamContent(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        onChunk(chunkText);
      }
    } catch (error) {
      console.error('Gemini Stream Error:', error);
      throw new Error(`Failed to stream content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export factory for custom configurations
export const createGeminiService = (config: GeminiConfig) => new GeminiService(config);

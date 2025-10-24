'use server';

/**
 * @fileOverview Provides an initial dramatic analysis of an Arabic script.
 *
 * - initialDramaticAnalysis - A function that analyzes an Arabic script and provides an initial dramatic analysis.
 * - InitialDramaticAnalysisInput - The input type for the initialDramaticAnalysis function.
 * - InitialDramaticAnalysisOutput - The return type for the initialDramaticAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialDramaticAnalysisInputSchema = z.object({
  arabicScript: z
    .string()
    .describe('The Arabic script to analyze.'),
});
export type InitialDramaticAnalysisInput = z.infer<typeof InitialDramaticAnalysisInputSchema>;

const InitialDramaticAnalysisOutputSchema = z.object({
  analysis: z.string().describe('The initial dramatic analysis of the script.'),
});
export type InitialDramaticAnalysisOutput = z.infer<typeof InitialDramaticAnalysisOutputSchema>;

export async function initialDramaticAnalysis(
  input: InitialDramaticAnalysisInput
): Promise<InitialDramaticAnalysisOutput> {
  return initialDramaticAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialDramaticAnalysisPrompt',
  input: {schema: InitialDramaticAnalysisInputSchema},
  output: {schema: InitialDramaticAnalysisOutputSchema},
  prompt: `You are a seasoned dramatic script analyst.

  Analyze the following Arabic script and provide an initial dramatic analysis, identifying potential strengths and weaknesses based on common story structures and tropes.
  
  Arabic Script: {{{arabicScript}}}`,
});

const initialDramaticAnalysisFlow = ai.defineFlow(
  {
    name: 'initialDramaticAnalysisFlow',
    inputSchema: InitialDramaticAnalysisInputSchema,
    outputSchema: InitialDramaticAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

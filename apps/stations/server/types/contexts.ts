export interface Station1Context {
  fullText: string;
  projectName: string;
  proseFilePath?: string;
}

export interface Station2Context {
  majorCharacters: string[];
  relationshipSummary: string;
  narrativeTone: string;
  fullText: string;
}

export interface Station3Context {
  majorCharacters: string[];
  characterProfiles: Map<string, unknown>;
  relationshipData: unknown[];
  fullText: string;
}

export interface AIPromptContext {
  systemInstruction?: string;
  previousAnalysis?: string;
  analysisGoal: string;
  textSample: string;
  constraints?: string[];
}

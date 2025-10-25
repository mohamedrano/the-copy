// إعادة التصدير من الأنواع الأساسية
export * from "./core/types";

// Note: Result and AIResponse are now defined in core/types and re-exported above

export interface ProcessedFile {
  fileName: string;
  textContent: string;
  size: number;
  sizeBytes: number;
  name?: string;
}

// AIRequest is now defined in core/types

// AIResponse is now defined in core/types

// Result is now defined in core/types

export type AgentId = string;

export interface AIAgentCapabilities {
  canAnalyze?: boolean;
  canGenerate?: boolean;
  canTransform?: boolean;
  canPredict?: boolean;
  requiresContext?: boolean;
  multiModal?: boolean;
  requiresFiles?: boolean;
  reasoningChains?: boolean;
  toolUse?: boolean;
  memorySystem?: boolean;
  selfReflection?: boolean;
  ragEnabled?: boolean;
  vectorSearch?: boolean;
  agentOrchestration?: boolean;
  metacognitive?: boolean;
  adaptiveLearning?: boolean;
  complexityScore?: number;
  accuracyLevel?: number;
  processingSpeed?: string;
  resourceIntensity?: string;
  languageModeling?: boolean;
  patternRecognition?: boolean;
  contextualUnderstanding?: boolean;
  creativeSynthesis?: boolean;
  logicalInference?: boolean;
  emotionalIntelligence?: boolean;
  culturalAwareness?: boolean;
  temporalReasoning?: boolean;
  spatialReasoning?: boolean;
  narrativeConstruction?: boolean;
  characterPsychology?: boolean;
  dialogueGeneration?: boolean;
  sceneComposition?: boolean;
  thematicAnalysis?: boolean;
  structuralAnalysis?: boolean;
  styleAdaptation?: boolean;
  audienceModeling?: boolean;
  feedbackIntegration?: boolean;
  iterativeRefinement?: boolean;
  crossDomainKnowledge?: boolean;
  ethicalConsideration?: boolean;
  creativeGeneration?: boolean;
  analyticalReasoning?: boolean;
  outputType?: string;
  [key: string]: any; // Allow any additional properties for flexibility
}

export interface AIAgentConfig {
  id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  capabilities?: AIAgentCapabilities;
  dependencies?: string[];
  collaborators?: string[];
  enhancedBy?: string[];
  dependsOn?: string[];
  collaboratesWith?: string[];
  enhances?: string[];
  prompt?: string;
  systemInstruction?: string;
  systemPrompt?: string;
  fewShotExamples?: any[];
  chainOfThoughtTemplate?: string;
  cacheStrategy?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any; // Allow any additional properties for flexibility
}

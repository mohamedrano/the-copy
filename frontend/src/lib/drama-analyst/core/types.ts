// واجهات أساسية مطلوبة من عدة وحدات
export interface Result<T, E = Error> {
  ok: boolean;
  value?: T;
  error?:
    | E
    | {
        code: string;
        message: string;
        cause?: any;
      };
}

export interface AIRequest {
  agent: string;
  prompt: string;
  files?: { fileName: string; sizeBytes: number }[];
  params?: any;
  parameters?: any;
}

export interface AIResponse {
  text?: string;
  tokensUsed?: number;
  meta?: Record<string, unknown>;
  raw?: string;
  parsed?: any;
  agent?: string;
}

export interface ProcessedFile {
  fileName: string;
  content: string;
  sizeBytes: number;
  mimeType?: string;
  textContent?: string;
  size?: number;
  name?: string;
}

export interface AIAgentCapabilities {
  // حقول مستخدمة بالفعل في الكود
  reasoningChains?: boolean;
  ragEnabled?: boolean;
  agentOrchestration?: boolean;
  metacognitive?: boolean;
  multiModal?: boolean;
  complexityScore?: number;
  accuracyLevel?: number;
  processingSpeed?: number | string;
  resourceIntensity?: number | string;
  memorySystem?: boolean;
  toolUse?: boolean;
  vectorSearch?: boolean;
  adaptiveLearning?: boolean;
  contextWindow?: number;
  responseLatency?: number;
  scalability?: number;
  reliability?: number;
  canAnalyze?: boolean;
  canGenerate?: boolean;
  canTransform?: boolean;
  canPredict?: boolean;
  requiresContext?: boolean;
  requiresFiles?: boolean;
  selfReflection?: boolean;
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
  [key: string]: any;
}

export type CacheStrategy = "none" | "memory" | "disk";

export interface AIAgentConfig {
  id: string;
  name?: string;
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
  parallelizable?: boolean;
  cacheStrategy?: CacheStrategy | string;
  confidenceThreshold?: number;
  prompt?: string;
  systemInstruction?: string;
  systemPrompt?: string;
  fewShotExamples?: any[];
  chainOfThoughtTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

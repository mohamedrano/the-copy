import { TaskCategory, TaskType } from './enums';

export interface AIAgentCapabilities {
  // Core AI Techniques
  multiModal: boolean;              // معالجة متعددة الوسائط
  reasoningChains: boolean;         // سلاسل التفكير
  toolUse: boolean;                 // استخدام الأدوات
  memorySystem: boolean;            // نظام الذاكرة
  selfReflection: boolean;          // التفكير الذاتي

  // Advanced Features
  ragEnabled: boolean;              // تعزيز البحث والإنتاج
  vectorSearch: boolean;            // البحث الشعاعي
  agentOrchestration: boolean;      // تنسيق الوكلاء
  metacognitive: boolean;           // ما وراء المعرفة
  adaptiveLearning: boolean;        // التعلم التكيفي

  // Performance Metrics
  complexityScore: number;          // درجة التعقيد (0-1)
  accuracyLevel: number;            // مستوى الدقة (0-1)
  processingSpeed: 'fast' | 'medium' | 'slow' | 'adaptive';
  resourceIntensity: 'low' | 'medium' | 'high' | 'variable';

  // Specialized Capabilities
  languageModeling: boolean;        // نمذجة اللغة
  patternRecognition: boolean;      // تمييز الأنماط
  creativeGeneration: boolean;      // التوليد الإبداعي
  analyticalReasoning: boolean;     // التفكير التحليلي
  emotionalIntelligence: boolean;   // الذكاء العاطفي
}

export interface AIAgentConfig {
  id: TaskType;
  name: string;
  description: string;
  category: TaskCategory;
  capabilities: AIAgentCapabilities;

  // Agent Collaboration
  collaboratesWith: TaskType[];     // الوكلاء المتعاونون
  dependsOn: TaskType[];           // التبعيات
  enhances: TaskType[];            // يعزز وكلاء آخرين

  // Prompt Engineering
  systemPrompt: string;
  fewShotExamples: string[];
  chainOfThoughtTemplate: string;

  // Performance Optimization
  cacheStrategy: 'none' | 'aggressive' | 'selective' | 'adaptive';
  parallelizable: boolean;
  batchProcessing: boolean;

  // Quality Assurance
  validationRules: string[];
  outputSchema: object;
  confidenceThreshold: number;
}

// Defined types based on user feedback
export interface DataPoint {
  x: number | string; // Can be a numerical value (e.g., time) or categorical (e.g., scene number)
  y: number;          // The value for the point (e.g., tension level)
  label?: string;     // Optional label for the data point
}

export interface NetworkGraphNode {
  id: string;         // Unique identifier for the node (e.g., character name)
  label: string;      // Display label for the node
  group?: string | number; // Optional group for coloring or categorization
  value?: number;     // Optional value associated with the node (e.g., importance)
}

export interface NetworkGraphEdge {
  from: string;       // ID of the source node
  to: string;         // ID of the target node
  label?: string;      // Optional label for the edge (e.g., relationship type)
  value?: number;     // Optional weight or strength of the connection
  arrows?: string;    // e.g., 'to', 'from', 'middle' to indicate direction
}

export interface NetworkGraph {
  nodes: NetworkGraphNode[];
  edges: NetworkGraphEdge[];
  description?: string; // A textual summary or interpretation of the graph
}


// Shared JSON value helpers
export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject { [key: string]: JsonValue; }
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// ===== Core Domain Types =====
export type ByteSize = number;

export interface ProcessedFile {
  /** المسار الكامل على ويندوز */
  absolutePath: string;
  /** اسم الملف فقط */
  fileName: string;
  /** النوع MIME إن عُرف */
  mimeType?: string;
  /** الترميز النصي إن كان المحتوى نصياً */
  encoding?: 'utf8'|'utf16le'|'ascii';
  /** الحجم بالبايت */
  sizeBytes: ByteSize;
  /** محتوى نصي (اختياري — بديل عن البافر) */
  textContent?: string;
  /** محتوى ثنائي (اختياري) */
  bufferContentBase64?: string;
}

export type AgentId =
  | 'adaptiveRewriting' | 'analysis' | 'audienceResonance'
  | 'characterDeepAnalyzer' | 'characterNetwork' | 'characterVoice'
  | 'completion' | 'conflictDynamics' | 'creative'
  | 'culturalHistoricalAnalyzer' | 'dialogueAdvancedAnalyzer' | 'dialogueForensics'
  | 'integrated' | 'literaryQualityAnalyzer' | 'platformAdapter'
  | 'plotPredictor' | 'producibilityAnalyzer' | 'recommendationsGenerator'
  | 'rhythmMapping' | 'sceneGenerator' | 'styleFingerprint'
  | 'targetAudienceAnalyzer' | 'tensionOptimizer' | 'thematicMining'
  | 'themesMessagesAnalyzer' | 'visualCinematicAnalyzer' | 'worldBuilder';

export interface AIRequest {
  agent: AgentId;
  prompt: string;
  files?: ProcessedFile[];
  params?: Record<string, unknown>;
}

export interface AIResponse {
  agent: AgentId;
  /** نص الاستجابة الخام من النموذج */
  raw: string;
  /** إن كانت هناك محاولة لتنسيق مخرجات JSON من الوكيل */
  parsed?: unknown;
  /** ميتاداتا (tokens, timings, model name, status codes...) */
  meta?: Record<string, unknown>;
}

export interface ServiceError {
  code: string;
  message: string;
  cause?: unknown;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

// Domain stubs expressed as safe records instead of any
export type RhythmPattern = JsonObject;
export type ConflictData = JsonObject;
export type EditableSection = JsonObject;
export type Scenario = JsonObject;
export type WhatIfResult = JsonObject;
export type ImpactMetrics = JsonObject;
export type GrowthPoint = JsonObject;
export type VocabularyData = JsonObject;
export type Pattern = JsonObject;
export type EmotionData = JsonObject;
export type RelationshipEdge = NetworkGraphEdge; // Using defined type
export type TimelineEvent = JsonObject;
export type Development = JsonObject;
export type Conflict = JsonObject;
export type Breakpoint = JsonObject;
export type TransitionData = JsonObject;
export type WorkComparison = JsonObject;
export type DeviationData = JsonObject;
export type ComplexityMetrics = JsonObject;
export type Device = JsonObject;
export type Phrase = JsonObject;
export type TemporalPattern = JsonObject;
export type RevealStrategy = JsonObject;
export type VoiceCharacteristics = JsonObject;
export type Theme = JsonObject;
export type Symbol = JsonObject;
export type Philosophy = JsonObject;
export type Reference = JsonObject;
export type Feature = JsonObject;
export type EmotionCurve = DataPoint[]; // Using defined type
export type DemographicResponse = JsonObject;
export type PsychographicResponse = JsonObject;
export type CulturalResponse = JsonObject;
export type Controversy = JsonObject;
export type ViralPotential = JsonObject;
export type Sensitivity = JsonObject;
export type UniversalElement = JsonObject;
export type Modification = JsonObject;
export type Approach = JsonObject;
export type PlatformStrategy = JsonObject;
export type Setting = JsonObject;
export type AtmosphereData = JsonObject;
export type SensoryMap = JsonObject;
export type SpatialGraph = JsonObject;
export type Law = JsonObject;
export type Norm = JsonObject;
export type Code = JsonObject;
export type LogicSystem = JsonObject;
export type Timeline = JsonObject;
export type Mythology = JsonObject;
export type PowerMap = JsonObject;
export type Economy = JsonObject;
export type ConflictSource = JsonObject;
export type ThematicElement = JsonObject;
export type Constraint = JsonObject;
export type Possibility = JsonObject;
export type TensionPoint = DataPoint; // Using defined type
export type StructuralChange = JsonObject;
export type PaceData = JsonObject;
export type CliffhangerPoint = JsonObject;
export type Demographics = JsonObject;
export type Adjustment = JsonObject;
export type Hook = JsonObject;
export type Interactive = JsonObject;
export type Episode = JsonObject;
export type BingeStrategy = JsonObject;
export type SocialFeature = JsonObject;
export type PlotPoint = JsonObject;
export type PlotPath = JsonObject;
export type Pitfall = JsonObject;
export type SurpriseElement = JsonObject;
export type CoherenceCheck = JsonObject;
export type StructuredContent = JsonObject;
export type FileMetadata = JsonObject;
export type InitialInsights = JsonObject;
export type UnifiedContent = JsonObject;
export type ConsistencyReport = JsonObject;
export type VisualData = JsonObject;
export type AudioReference = JsonObject;
export type MultimediaInsights = JsonObject;
export type ActionItem = JsonObject;
export type ImprovementPlan = JsonObject;
export type StrategicGoal = JsonObject;
export type PrioritizedList = JsonArray;
export type ImplementationTracker = JsonObject;
export type ImpactReport = JsonObject;
export type UsageData = JsonObject;
export type UserProfile = JsonObject;
export type UIConfiguration = JsonObject;
export type UserFeedback = JsonObject;
export type FeedbackDatabase = JsonObject;
export type AlgorithmUpdate = JsonObject;
export type QualityMetrics = JsonObject;
export type TextCorpus = JsonObject;
export type Rule = JsonObject;
export type MarketData = JsonObject;
export type SuccessMetrics = JsonObject;
export type Optimization = JsonObject;
export type Risk = JsonObject;
export type RiskMatrix = JsonObject;
export type MitigationStrategy = JsonObject;
export type MarketAnalysis = JsonObject;
export type Innovation = JsonObject;
export type PotentialReport = JsonObject;
export type InnovativeIdea = JsonObject;


// واجهة نتائج التحليل المتقدمة
export interface EnhancedAnalysisResult {
  title: string;
  content: string; // Could be a summary or main textual output if JSON is rich
  confidence?: number;
  metrics?: {
    dramaticTension?: number;
    paceIndex?: number;
    dialogueEfficiency?: number;
    structuralIntegrity?: number;
    characterDepth?: number;
    thematicResonance?: number;
  };
  visualizations?: {
    tensionCurve?: DataPoint[];
    characterNetwork?: NetworkGraph;
    rhythmMap?: RhythmPattern[]; // Could be array of DataPoint arrays for multiple rhythms
    conflictMatrix?: ConflictData[][]; // Or a more structured matrix type
  };
  recommendations?: SmartRecommendation[];
  interactiveElements?: {
    editableSections?: EditableSection[];
    alternativeScenarios?: Scenario[];
    whatIfAnalysis?: WhatIfResult[];
  };
}

// واجهة للتوصيات الذكية
export interface SmartRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'structure' | 'character' | 'dialogue' | 'pacing' | 'theme' | 'other' | string; // Added string for future flexibility
  issue: string;
  solution: string;
  implementation?: {
    before: string;
    after: string;
    impact: ImpactMetrics;
  };
  aiConfidence?: number;
  estimatedEffort?: 'minimal' | 'moderate' | 'significant';
}

// واجهة لتحليل الشخصيات المتقدم
export interface CharacterAnalysis {
  id?: string; // Character ID or name
  name: string;
  content?: string; // Main textual output for character analysis summary
  psychologicalProfile?: {
    archetype?: string;
    motivations?: string[];
    fears?: string[];
    contradictions?: string[];
    growthArc?: GrowthPoint[];
  };
  dialogueAnalysis?: {
    voiceConsistency?: number; // 0-1
    vocabularyProfile?: VocabularyData; // Could be word frequencies or complexity scores
    speechPatterns?: Pattern[]; // Common phrases, sentence structures
    emotionalRange?: EmotionData[]; // Emotions expressed and their intensity
  };
  relationships?: NetworkGraph; // Using defined NetworkGraph for character relationships
  predictions?: {
    likelyDevelopments?: Development[];
    potentialConflicts?: Conflict[];
    characterBreakpoints?: Breakpoint[]; // Points where character might change significantly
  };
}

// واجهة لتحليل الإيقاع الدرامي
export interface RhythmAnalysis {
  overallPace?: 'slow' | 'moderate' | 'fast' | 'variable';
  content?: string; // Main textual output for rhythm analysis summary
  sceneAnalysis?: {
    sceneId: string;
    duration?: number; // Could be page count, word count, or estimated time
    intensity?: number; // 0-1 scale
    function?: 'exposition' | 'rising_action' | 'climax' | 'falling_action' | 'resolution' | 'other';
    transitions?: TransitionData[]; // How this scene transitions to the next
  }[];
  criticalPoints?: {
    location: number | string; // e.g., page number, scene ID, or % through text
    type: 'acceleration' | 'deceleration' | 'plateau' | 'spike' | 'turn';
    severity?: number; // 0-1
    recommendation?: string;
  }[];
  distribution?: { // Percentage or count
    actionScenes?: number;
    dialogueScenes?: number;
    contemplativeScenes?: number;
    transitionScenes?: number;
  };
  benchmarkComparison?: {
    genre?: string;
    similarWorks?: WorkComparison[]; // Comparison to known works
    deviationAnalysis?: DeviationData; // How it deviates from genre norms
  };
  rhythmMap?: DataPoint[]; // A specific visualization for the overall rhythm
}

export interface StyleFingerprintAnalysis {
  content?: string; // Main textual output summary
  linguisticSignature?: {
    sentenceComplexity?: ComplexityMetrics; // Avg sentence length, use of clauses
    vocabularyRichness?: number; // Type-token ratio, use of rare words
    syntacticPatterns?: Pattern[]; // Common sentence structures
    rhetoricalDevices?: Device[]; // Metaphors, similes, etc.
    uniquePhrases?: Phrase[]; // Phrases unique to this author/text
  };
  narrativeSignature?: {
    perspectivePreference?: string[]; // First person, third person limited/omniscient
    temporalManipulation?: TemporalPattern[]; // Flashbacks, flashforwards
    informationReveal?: RevealStrategy; // How information is given to the reader
    narrativeVoice?: VoiceCharacteristics; // Tone, style of narrator
  };
  thematicSignature?: {
    coreThemes?: Theme[]; // Identified major themes
    symbolSystem?: Symbol[]; // System of symbols used
    philosophicalUnderpinnings?: Philosophy[]; // Underlying philosophical ideas
    culturalReferences?: Reference[]; // References to cultural elements
  };
  uniqueness?: {
    similarityScores?: Map<string, number>; // Comparison with other authors/texts
    distinctiveFeatures?: Feature[]; // Features that make this style unique
    genreConformity?: number; // How much it conforms to genre conventions (0-1)
    innovationIndex?: number; // How innovative the style is (0-1)
  };
}

export interface AudienceResonanceAnalysis {
  content?: string; // Main textual output summary
  predictedResponse?: {
    emotionalImpact?: EmotionCurve[]; // Predicted emotional journey of the audience
    engagementLevel?: number; // Predicted engagement (0-1)
    shareability?: number; // Likelihood of being shared (0-1)
    memorability?: number; // How memorable the content is (0-1)
  };
  segmentAnalysis?: { // Analysis for different audience segments
    demographics?: DemographicResponse[];
    psychographics?: PsychographicResponse[];
    culturalGroups?: CulturalResponse[];
  };
  riskOpportunity?: {
    potentialControversies?: Controversy[];
    viralMoments?: ViralPotential[]; // Moments with high viral potential
    culturalSensitivities?: Sensitivity[]; // Potential cultural sensitivities
    universalAppeals?: UniversalElement[]; // Elements with universal appeal
  };
  optimizationSuggestions?: {
    targetAudience?: string;
    modifications?: Modification[]; // Suggested changes to improve resonance
    alternativeApproaches?: Approach[];
    platformSpecific?: PlatformStrategy[];
  };
}

export interface WorldBuilderResult {
  content?: string; // Main textual output for world building summary or narrative description
  physicalWorld?: {
    settings?: Setting[]; // Descriptions of key locations
    atmosphere?: AtmosphereData; // Overall mood and atmosphere
    sensoryDetails?: SensoryMap; // Map of sensory experiences
    spatialRelationships?: SpatialGraph; // How locations are connected
  };
  worldRules?: {
    physicalLaws?: Law[]; // Unique physical laws of the world
    socialNorms?: Norm[]; // Social customs and norms
    culturalCodes?: Code[]; // Cultural behaviors and codes
    internalLogic?: LogicSystem; // The underlying logic of the world
  };
  worldContext?: {
    historicalBackground?: Timeline; // Key historical events
    mythologySystem?: Mythology; // Myths and legends
    powerStructures?: PowerMap; // Who holds power and how
    economicSystem?: Economy; // How the economy works
  };
  dramaticIntegration?: {
    conflictGenerators?: ConflictSource[]; // Elements in the world that generate conflict
    thematicResonators?: ThematicElement[]; // Elements that resonate with themes
    characterConstraints?: Constraint[]; // How the world constrains characters
    narrativePossibilities?: Possibility[]; // Unique story possibilities offered by the world
  };
}

export interface TensionOptimizerResult {
  content?: string; // Main textual output, e.g., summary of optimizations
  currentTensionMap?: TensionPoint[]; // Tension points in the original text
  optimizationStrategy?: {
    insertionPoints?: { // Suggested points to insert elements
      location: number | string; // Page, scene, or %
      suggestedElement: 'conflict' | 'revelation' | 'complication' | 'deadline' | 'stakes_increase' | 'mystery';
      expectedImpact?: number; // 0-1
    }[];
    removalSuggestions?: { // Elements to remove or alter
      location: number | string;
      reason: string; // Why it should be removed/altered
      alternativeHandling?: string; // How to handle it differently
    }[];
    reorderingSuggestions?: { // Scenes or events to reorder
      currentOrder: (number | string)[];
      suggestedOrder: (number | string)[];
      rationale?: string;
    };
  };
  predictedOutcome?: {
    newTensionCurve?: DataPoint[]; // Predicted tension curve after optimization
    audienceEngagement?: number; // Predicted change in engagement (0-1)
    dramaticSatisfaction?: number; // Predicted change in satisfaction (0-1)
  };
}

export interface PlatformAdapterResult {
  platform?: 'cinema' | 'tv_series' | 'streaming_film' | 'streaming_series' | 'theater' | 'web_short' | 'interactive_narrative';
  content?: string; // Main textual output, e.g., summary of adaptations
  adaptations?: {
    structural?: {
      originalFormat?: string;
      adaptedFormat?: string;
      modifications?: StructuralChange[]; // e.g., act changes, scene splits
    };
    pacing?: {
      originalPace?: PaceData;
      platformOptimizedPace?: PaceData;
      cliffhangers?: CliffhangerPoint[]; // Suggested cliffhanger points for episodic
    };
    audience?: {
      platformDemographics?: Demographics; // Target audience on the new platform
      contentAdjustments?: Adjustment[]; // Adjustments for that audience
      engagementHooks?: Hook[]; // Hooks specific to platform audience
    };
  };
  platformSpecificFeatures?: { // How to leverage features of the target platform
    interactiveElements?: Interactive[];
    episodicStructure?: Episode[]; // For series
    bingeOptimization?: BingeStrategy; // For streaming series
    socialIntegration?: SocialFeature[]; // For web content
  };
}

export interface PlotPredictorResult {
  content?: string; // Main textual output (e.g., the predicted plot itself or a summary)
  currentTrajectory?: PlotPoint[]; // Key points in the current plot
  predictions?: {
    likelyDevelopments?: {
      scenario: string; // Description of the predicted development
      probability?: number; // 0-1
      narrativeLogic?: string; // Why this development is logical
      dramaticValue?: number; // Potential dramatic impact (0-1)
    }[];
    alternativePaths?: {
      path: PlotPath; // Description of an alternative path
      innovationScore?: number; // How innovative this path is (0-1)
      riskLevel?: 'low' | 'medium' | 'high';
      potentialImpact?: string; // Potential impact of this path
    }[];
    convergencePoints?: { // Points where different plot paths might converge
      location: number | string; // Page, scene, or %
      inevitability?: number; // How inevitable this convergence is (0-1)
      alternatives?: string[]; // Alternative outcomes at convergence
    }[];
  };
  recommendations?: {
    optimalPath?: PlotPath; // The AI's recommended path
    avoidPitfalls?: Pitfall[]; // Pitfalls to avoid
    maximizeSurprise?: SurpriseElement[]; // Elements to maximize surprise
    maintainCoherence?: CoherenceCheck[]; // Checks to maintain coherence
  };
}

// النوع الوحيد المسموح به الآن هو النص فقط
export type GeminiTaskResultData = string;

export interface GeminiServiceResponse {
  data?: string;
  rawText?: string;
  error?: string;
}

export interface PreviousCompletionContext {
  filesHash: string; // Hash of original files (e.g., names + total size)
  originalTask: TaskType;
  completionScopeOfResult: string;
  lastCompletionOutput: string; // The text output of the last completion
}

export interface CompletionEnhancementOption {
  id: TaskType;
  label: string;
}

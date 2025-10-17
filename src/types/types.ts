/**
 * @file This file defines the core TypeScript types and enums used throughout the application.
 * These types ensure consistency and provide strong typing for agent configurations, tasks, and other critical data structures.
 * 
 * @public
 */

/**
 * Defines the unique identifiers for all available agent tasks.
 * 
 * This enum is crucial for task routing, agent selection, and configuration mapping.
 * Each task type corresponds to a specific AI agent capability and is used throughout
 * the application to identify and route tasks to appropriate agents.
 * 
 * @public
 * @enum {string}
 */
export const enum TaskType {
    // Core foundational agents
    ANALYSIS = 'analysis',
    CREATIVE = 'creative',
    INTEGRATED = 'integrated',
    COMPLETION = 'completion',
    
    // Advanced analytical agents
    RHYTHM_MAPPING = 'rhythm-mapping',
    CHARACTER_NETWORK = 'character-network',
    DIALOGUE_FORENSICS = 'dialogue-forensics',
    THEMATIC_MINING = 'thematic-mining',
    STYLE_FINGERPRINT = 'style-fingerprint',
    CONFLICT_DYNAMICS = 'conflict-dynamics',
    
    // Creative generation agents
    ADAPTIVE_REWRITING = 'adaptive-rewriting',
    SCENE_GENERATOR = 'scene-generator',
    CHARACTER_VOICE = 'character-voice',
    WORLD_BUILDER = 'world-builder',
    
    // Predictive & optimization agents
    PLOT_PREDICTOR = 'plot-predictor',
    TENSION_OPTIMIZER = 'tension-optimizer',
    AUDIENCE_RESONANCE = 'audience-resonance',
    PLATFORM_ADAPTER = 'platform-adapter',
    
    // Advanced specialized modules
    CHARACTER_DEEP_ANALYZER = 'character-deep-analyzer',
    DIALOGUE_ADVANCED_ANALYZER = 'dialogue-advanced-analyzer',
    VISUAL_CINEMATIC_ANALYZER = 'visual-cinematic-analyzer',
    THEMES_MESSAGES_ANALYZER = 'themes-messages-analyzer',
    CULTURAL_HISTORICAL_ANALYZER = 'cultural-historical-analyzer',
    PRODUCIBILITY_ANALYZER = 'producibility-analyzer',
    TARGET_AUDIENCE_ANALYZER = 'target-audience-analyzer',
    LITERARY_QUALITY_ANALYZER = 'literary-quality-analyzer',
    RECOMMENDATIONS_GENERATOR = 'recommendations-generator',
    
    // Additional task types for compatibility
    SUMMARIZE = 'summarize',
    ANALYZE_CHARACTERS = 'analyze-characters',
    CREATIVE_WRITING = 'creative-writing',
    PLOT_PREDICTION = 'plot-prediction',
    THEMATIC_ANALYSIS = 'thematic-analysis',
    STYLE_ANALYSIS = 'style-analysis',
    SCENE_GENERATION = 'scene-generation',
    WORLDBUILDING = 'worldbuilding',
    TENSION_ANALYSIS = 'tension-analysis',
    ADAPTATION = 'adaptation',
    VISUAL_ANALYSIS = 'visual-analysis',
    THEME_MESSAGE_ANALYSIS = 'theme-message-analysis',
    RECOMMENDATION = 'recommendation',
    
    // Additional missing task types
    AUDIENCE_ANALYSIS = 'audience-analysis',
    TEXT_COMPLETION = 'text-completion',
    COMPREHENSIVE_ANALYSIS = 'comprehensive-analysis',
    CHARACTER_ANALYSIS = 'character-analysis'
}

/**
 * Categorizes agents into broad functional groups for organization and presentation.
 * 
 * This enum helps in organizing and presenting agents to users by grouping them
 * into logical categories based on their primary function or capability area.
 * 
 * @public
 * @enum {string}
 */
export const enum TaskCategory {
    CORE = 'CORE',
    ANALYSIS = 'ANALYSIS',
    ANALYSES = 'ANALYSES',
    AGENTS = 'AGENTS',
    CREATIVE = 'CREATIVE',
    PREDICTIVE = 'PREDICTIVE',
    ADVANCED_MODULES = 'ADVANCED_MODULES',
    EVALUATION = 'EVALUATION',
    GENERATION = 'GENERATION',
    INTEGRATION = 'INTEGRATION'
}

/**
 * Defines the structure for an option that can enhance a completion task.
 * 
 * This interface is used to represent enhancement options that can be applied
 * to text completion tasks, providing both the task identifier and user-friendly label.
 * 
 * @public
 * @property id - The unique identifier for the enhancement task.
 * @property label - The user-facing label for the enhancement option.
 */
export interface CompletionEnhancementOption {
    /** The unique identifier for the enhancement task. */
    id: TaskType;
    /** The user-facing label for the enhancement option. */
    label: string;
}

/**
 * Provides a comprehensive configuration for an AI agent.
 * 
 * This interface details everything from the agent's identity and capabilities to its operational parameters.
 * It serves as the primary configuration structure for all AI agents in the system, ensuring
 * consistent configuration management and agent behavior.
 * 
 * @public
 * @property id - The unique identifier for the agent, linking it to a specific task.
 * @property name - The user-friendly name of the agent.
 * @property description - A detailed description of the agent's purpose and functionality.
 * @property category - The category the agent belongs to.
 * @property capabilities - A detailed object outlining the agent's technical and cognitive abilities.
 * @property collaboratesWith - A list of other agents this agent can collaborate with.
 * @property dependsOn - A list of agents whose output is required before this agent can run.
 * @property enhances - A list of agents that this agent can enhance.
 * @property systemPrompt - The base instruction or persona given to the AI model.
 * @property fewShotExamples - Examples provided to the model to guide its responses.
 * @property chainOfThoughtTemplate - A template for structured, multi-step reasoning.
 * @property cacheStrategy - The caching mechanism to use for the agent's responses.
 * @property parallelizable - Indicates if the agent can be run in parallel with others.
 * @property batchProcessing - Indicates if the agent supports processing multiple inputs at once.
 * @property validationRules - Rules for validating the agent's output.
 * @property outputSchema - The expected schema of the agent's output.
 * @property confidenceThreshold - The minimum confidence level required for the agent to return a result.
 */
export interface AIAgentConfig {
    id?: string;
    name: string;
    description: string;
    category: TaskCategory | string;
    taskType?: TaskType;
    instructions?: string;
    capabilities?: string[] | Record<string, boolean | string | number>;
    collaboratesWith?: TaskType[];
    dependsOn?: TaskType[];
    enhances?: TaskType[];
    modelConfig?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
    };
    systemPrompt?: string;
    userPrompt?: string;
    expectedOutput?: string;
    processingInstructions?: string;
    qualityGates?: string[];
    fallbackBehavior?: string;
    confidenceThreshold?: number;
    fewShotExamples?: any[];
    chainOfThoughtTemplate?: string;
    cacheStrategy?: string;
    parallelizable?: boolean;
    batchProcessing?: boolean;
    validationRules?: string[];
    outputSchema?: any;
}

/**
 * Represents a single spoken or parenthetical line in the structured screenplay model.
 * 
 * This interface captures individual dialogue elements within a screenplay, including
 * both spoken dialogue and parenthetical directions. It provides comprehensive
 * metadata for tracking and analyzing dialogue content.
 * 
 * @public
 * @property id - Unique identifier generated for tracking the dialogue line.
 * @property character - Character name associated with the line.
 * @property text - Raw text content of the line.
 * @property lineNumber - One-based index of the line within the original script.
 * @property sceneId - Identifier of the scene that contains this line.
 * @property type - Type of dialogue line captured.
 */
export interface DialogueLine {
    /** Unique identifier generated for tracking the dialogue line. */
    id: string;
    /** Character name associated with the line. */
    character: string;
    /** Raw text content of the line. */
    text: string;
    /** One-based index of the line within the original script. */
    lineNumber: number;
    /** Identifier of the scene that contains this line. */
    sceneId: string;
    /**
     * Type of dialogue line captured.
     * `dialogue` denotes spoken text whereas `parenthetical` stores inline directions.
     */
    type: 'dialogue' | 'parenthetical';
}

/**
 * Captures metadata for a screenplay character and their dialogue footprint.
 * 
 * This interface represents a character within a screenplay, including their
 * dialogue statistics and appearance information. It's used for character
 * analysis and tracking throughout the screenplay.
 * 
 * @public
 * @property name - Canonical character name.
 * @property dialogueCount - Total number of dialogue lines attributed to the character.
 * @property dialogueLines - Detailed list of dialogue entries spoken by the character.
 * @property firstSceneId - Identifier of the first scene where the character appears.
 */
export interface Character {
    /** Canonical character name. */
    name: string;
    /** Total number of dialogue lines attributed to the character. */
    dialogueCount: number;
    /** Detailed list of dialogue entries spoken by the character. */
    dialogueLines: DialogueLine[];
    /** Identifier of the first scene where the character appears. */
    firstSceneId?: string;
}

/**
 * Stores action lines within a scene with their original ordering preserved.
 * 
 * This interface represents action or description lines within a screenplay scene,
 * maintaining their original position and content for accurate reconstruction.
 * 
 * @public
 * @property text - Original text for the action or description line.
 * @property lineNumber - One-based index within the screenplay.
 */
export interface SceneActionLine {
    /** Original text for the action or description line. */
    text: string;
    /** One-based index within the screenplay. */
    lineNumber: number;
}

/**
 * Represents a processed file for agent input.
 * 
 * This interface encapsulates file data that has been processed and prepared
 * for consumption by AI agents, including metadata about the file's format and content.
 * 
 * @public
 * @property name - The original filename.
 * @property content - The file content as a string.
 * @property mimeType - The MIME type of the file.
 * @property isBase64 - Whether the content is base64 encoded.
 * @property size - The size of the file in bytes.
 */
export interface ProcessedFile {
    /** The original filename. */
    name: string;
    /** The file content as a string. */
    content: string;
    /** The MIME type of the file. */
    mimeType: string;
    /** Whether the content is base64 encoded. */
    isBase64: boolean;
    /** The size of the file in bytes. */
    size: number;
}

/**
 * AI Writing Assistant interface for compatibility.
 * 
 * This interface provides a standardized way to interact with AI text generation
 * services, ensuring compatibility across different AI providers.
 * 
 * @public
 * @property generateText - Method to generate text using AI with given prompt and context.
 */
export interface AIWritingAssistantLike {
    /**
     * Generates text using AI based on a prompt and context.
     * 
     * @param prompt - The text prompt to send to the AI service.
     * @param context - Additional context to inform the AI's response.
     * @param options - Optional configuration parameters for the AI service.
     * @returns Promise resolving to an object containing the generated text.
     */
    generateText(prompt: string, context: string, options?: any): Promise<{ text?: string }>;
}

/**
 * Represents a structured screenplay scene extracted from free-form text.
 * 
 * This interface captures a complete scene within a screenplay, including its
 * metadata, dialogue, and action lines. It provides the building blocks for
 * screenplay analysis and manipulation.
 * 
 * @public
 * @property id - Stable identifier for the scene.
 * @property heading - Normalized heading text (e.g. "مشهد 1").
 * @property index - Zero-based scene position within the screenplay.
 * @property startLineNumber - One-based line number where the scene begins.
 * @property endLineNumber - One-based line number where the scene ends.
 * @property lines - Ordered list of raw lines included in the scene.
 * @property dialogues - Spoken and parenthetical dialogue entries contained in the scene.
 * @property actionLines - Descriptive or action-oriented lines associated with the scene.
 */
export interface Scene {
    /** Stable identifier for the scene. */
    id: string;
    /** Normalized heading text (e.g. "مشهد 1"). */
    heading: string;
    /** Zero-based scene position within the screenplay. */
    index: number;
    /** One-based line number where the scene begins. */
    startLineNumber: number;
    /** One-based line number where the scene ends. */
    endLineNumber?: number;
    /** Ordered list of raw lines included in the scene. */
    lines: string[];
    /** Spoken and parenthetical dialogue entries contained in the scene. */
    dialogues: DialogueLine[];
    /** Descriptive or action-oriented lines associated with the scene. */
    actionLines: SceneActionLine[];
}

/**
 * Root data model describing a structured screenplay document.
 * 
 * This interface represents the complete structured representation of a screenplay,
 * containing all scenes, characters, and dialogue information. It serves as the
 * primary data structure for screenplay analysis and manipulation.
 * 
 * @public
 * @property rawText - Original screenplay text provided by the user.
 * @property totalLines - Total number of lines in the screenplay.
 * @property scenes - Ordered collection of structured scenes.
 * @property characters - Aggregated character information keyed by character name.
 * @property dialogueLines - Flat list of all dialogue lines for quick inspection.
 */
export interface Script {
    /** Original screenplay text provided by the user. */
    rawText: string;
    /** Total number of lines in the screenplay. */
    totalLines: number;
    /** Ordered collection of structured scenes. */
    scenes: Scene[];
    /** Aggregated character information keyed by character name. */
    characters: Record<string, Character>;
    /** Flat list of all dialogue lines for quick inspection. */
    dialogueLines: DialogueLine[];
}
import { AIAgentConfig } from '@core/types';
import { TaskType } from '@core/enums';

// Dynamic Agent Loader
export const loadAgentConfig = async (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.ANALYSIS:
      return (await import('./analysis/agent')).ANALYSIS_AGENT_CONFIG;
    case TaskType.CREATIVE:
      return (await import('./creative/agent')).CREATIVE_AGENT_CONFIG;
    case TaskType.INTEGRATED:
      return (await import('./integrated/agent')).INTEGRATED_AGENT_CONFIG;
    case TaskType.COMPLETION:
      return (await import('./completion/agent')).COMPLETION_AGENT_CONFIG;
    case TaskType.RHYTHM_MAPPING:
      return (await import('./rhythmMapping/agent')).RHYTHM_MAPPING_AGENT_CONFIG;
    case TaskType.CHARACTER_NETWORK:
      return (await import('./characterNetwork/agent')).CHARACTER_NETWORK_AGENT_CONFIG;
    case TaskType.DIALOGUE_FORENSICS:
      return (await import('./dialogueForensics/agent')).DIALOGUE_FORENSICS_AGENT_CONFIG;
    case TaskType.THEMATIC_MINING:
      return (await import('./thematicMining/agent')).THEMATIC_MINING_AGENT_CONFIG;
    case TaskType.STYLE_FINGERPRINT:
      return (await import('./styleFingerprint/agent')).STYLE_FINGERPRINT_AGENT_CONFIG;
    case TaskType.CONFLICT_DYNAMICS:
      return (await import('./conflictDynamics/agent')).CONFLICT_DYNAMICS_AGENT_CONFIG;
    case TaskType.ADAPTIVE_REWRITING:
      return (await import('./adaptiveRewriting/agent')).ADAPTIVE_REWRITING_AGENT_CONFIG;
    case TaskType.SCENE_GENERATOR:
      return (await import('./sceneGenerator/agent')).SCENE_GENERATOR_AGENT_CONFIG;
    case TaskType.CHARACTER_VOICE:
      return (await import('./characterVoice/agent')).CHARACTER_VOICE_AGENT_CONFIG;
    case TaskType.WORLD_BUILDER:
      return (await import('./worldBuilder/agent')).WORLD_BUILDER_AGENT_CONFIG;
    case TaskType.PLOT_PREDICTOR:
      return (await import('./plotPredictor/agent')).PLOT_PREDICTOR_AGENT_CONFIG;
    case TaskType.TENSION_OPTIMIZER:
      return (await import('./tensionOptimizer/agent')).TENSION_OPTIMIZER_AGENT_CONFIG;
    case TaskType.AUDIENCE_RESONANCE:
      return (await import('./audienceResonance/agent')).AUDIENCE_RESONANCE_AGENT_CONFIG;
    case TaskType.PLATFORM_ADAPTER:
      return (await import('./platformAdapter/agent')).PLATFORM_ADAPTER_AGENT_CONFIG;
    case TaskType.CHARACTER_DEEP_ANALYZER:
      return (await import('./characterDeepAnalyzer/agent')).CHARACTER_DEEP_ANALYZER_AGENT_CONFIG;
    case TaskType.DIALOGUE_ADVANCED_ANALYZER:
      return (await import('./dialogueAdvancedAnalyzer/agent')).DIALOGUE_ADVANCED_ANALYZER_AGENT_CONFIG;
    case TaskType.VISUAL_CINEMATIC_ANALYZER:
      return (await import('./visualCinematicAnalyzer/agent')).VISUAL_CINEMATIC_ANALYZER_AGENT_CONFIG;
    case TaskType.THEMES_MESSAGES_ANALYZER:
      return (await import('./themesMessagesAnalyzer/agent')).THEMES_MESSAGES_ANALYZER_AGENT_CONFIG;
    case TaskType.CULTURAL_HISTORICAL_ANALYZER:
      return (await import('./culturalHistoricalAnalyzer/agent')).CULTURAL_HISTORICAL_ANALYZER_AGENT_CONFIG;
    case TaskType.PRODUCIBILITY_ANALYZER:
      return (await import('./producibilityAnalyzer/agent')).PRODUCIBILITY_ANALYZER_AGENT_CONFIG;
    case TaskType.TARGET_AUDIENCE_ANALYZER:
      return (await import('./targetAudienceAnalyzer/agent')).TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG;
    case TaskType.LITERARY_QUALITY_ANALYZER:
      return (await import('./literaryQualityAnalyzer/agent')).LITERARY_QUALITY_ANALYZER_AGENT_CONFIG;
    case TaskType.RECOMMENDATIONS_GENERATOR:
      return (await import('./recommendationsGenerator/agent')).RECOMMENDATIONS_GENERATOR_AGENT_CONFIG;
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
};
// Static imports removed to eliminate Vite dynamic import warnings
// All agent configs are now loaded dynamically via loadAgentConfig()

// Dynamic agent configs loader
export const getAllAgentConfigs = async (): Promise<AIAgentConfig[]> => {
  const configs: AIAgentConfig[] = [];
  
  // Load all agent configs dynamically
  const taskTypes = Object.values(TaskType) as TaskType[];
  
  for (const taskType of taskTypes) {
    try {
      const config = await loadAgentConfig(taskType);
      configs.push(config);
    } catch (error) {
      console.warn(`Failed to load agent config for ${taskType}:`, error);
    }
  }
  
  return configs;
};

// Legacy export for backward compatibility (will be deprecated)
export const AGENT_CONFIGS = Object.freeze<AIAgentConfig[]>([]);

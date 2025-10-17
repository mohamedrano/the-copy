import { TaskType } from '@core/enums';
import { AgentId } from '../core/types';
import { CORE_ANALYSIS_INSTRUCTIONS } from './analysis/instructions';
import { CORE_CREATIVE_INSTRUCTIONS } from './creative/instructions';
import { INTEGRATED_MODE_INSTRUCTIONS } from './integrated/instructions';
import { COMPLETION_MODE_INSTRUCTIONS } from './completion/instructions';
import { RHYTHM_MAPPING_INSTRUCTIONS } from './rhythmMapping/instructions';
import { CHARACTER_NETWORK_INSTRUCTIONS } from './characterNetwork/instructions';
import { DIALOGUE_FORENSICS_INSTRUCTIONS } from './dialogueForensics/instructions';
import { THEMATIC_MINING_INSTRUCTIONS } from './thematicMining/instructions';
import { STYLE_FINGERPRINT_INSTRUCTIONS } from './styleFingerprint/instructions';
import { CONFLICT_DYNAMICS_INSTRUCTIONS } from './conflictDynamics/instructions';
import { ADAPTIVE_REWRITING_INSTRUCTIONS } from './adaptiveRewriting/instructions';
import { SCENE_GENERATOR_INSTRUCTIONS } from './sceneGenerator/instructions';
import { CHARACTER_VOICE_INSTRUCTIONS } from './characterVoice/instructions';
import { WORLD_BUILDER_INSTRUCTIONS } from './worldBuilder/instructions';
import { PLOT_PREDICTOR_INSTRUCTIONS } from './plotPredictor/instructions';
import { TENSION_OPTIMIZER_INSTRUCTIONS } from './tensionOptimizer/instructions';
import { AUDIENCE_RESONANCE_INSTRUCTIONS } from './audienceResonance/instructions';
import { PLATFORM_ADAPTER_INSTRUCTIONS } from './platformAdapter/instructions';
import { CHARACTER_DEEP_ANALYZER_INSTRUCTIONS } from './characterDeepAnalyzer/instructions';
import { DIALOGUE_ADVANCED_ANALYZER_INSTRUCTIONS } from './dialogueAdvancedAnalyzer/instructions';
import { VISUAL_CINEMATIC_ANALYZER_INSTRUCTIONS } from './visualCinematicAnalyzer/instructions';
import { THEMES_MESSAGES_ANALYZER_INSTRUCTIONS } from './themesMessagesAnalyzer/instructions';
import { CULTURAL_HISTORICAL_ANALYZER_INSTRUCTIONS } from './culturalHistoricalAnalyzer/instructions';
import { PRODUCIBILITY_ANALYZER_INSTRUCTIONS } from './producibilityAnalyzer/instructions';
import { TARGET_AUDIENCE_ANALYZER_INSTRUCTIONS } from './targetAudienceAnalyzer/instructions';
import { LITERARY_QUALITY_ANALYZER_INSTRUCTIONS } from './literaryQualityAnalyzer/instructions';
import { RECOMMENDATIONS_GENERATOR_INSTRUCTIONS } from './recommendationsGenerator/instructions';

export const TASK_SPECIFIC_INSTRUCTIONS: Record<TaskType, string> = {
  [TaskType.ANALYSIS]: CORE_ANALYSIS_INSTRUCTIONS,
  [TaskType.CREATIVE]: CORE_CREATIVE_INSTRUCTIONS,
  [TaskType.INTEGRATED]: INTEGRATED_MODE_INSTRUCTIONS,
  [TaskType.COMPLETION]: COMPLETION_MODE_INSTRUCTIONS,
  [TaskType.RHYTHM_MAPPING]: RHYTHM_MAPPING_INSTRUCTIONS,
  [TaskType.CHARACTER_NETWORK]: CHARACTER_NETWORK_INSTRUCTIONS,
  [TaskType.DIALOGUE_FORENSICS]: DIALOGUE_FORENSICS_INSTRUCTIONS,
  [TaskType.THEMATIC_MINING]: THEMATIC_MINING_INSTRUCTIONS,
  [TaskType.STYLE_FINGERPRINT]: STYLE_FINGERPRINT_INSTRUCTIONS,
  [TaskType.CONFLICT_DYNAMICS]: CONFLICT_DYNAMICS_INSTRUCTIONS,
  [TaskType.ADAPTIVE_REWRITING]: ADAPTIVE_REWRITING_INSTRUCTIONS,
  [TaskType.SCENE_GENERATOR]: SCENE_GENERATOR_INSTRUCTIONS,
  [TaskType.CHARACTER_VOICE]: CHARACTER_VOICE_INSTRUCTIONS,
  [TaskType.WORLD_BUILDER]: WORLD_BUILDER_INSTRUCTIONS,
  [TaskType.PLOT_PREDICTOR]: PLOT_PREDICTOR_INSTRUCTIONS,
  [TaskType.TENSION_OPTIMIZER]: TENSION_OPTIMIZER_INSTRUCTIONS,
  [TaskType.AUDIENCE_RESONANCE]: AUDIENCE_RESONANCE_INSTRUCTIONS,
  [TaskType.PLATFORM_ADAPTER]: PLATFORM_ADAPTER_INSTRUCTIONS,
  [TaskType.CHARACTER_DEEP_ANALYZER]: CHARACTER_DEEP_ANALYZER_INSTRUCTIONS,
  [TaskType.DIALOGUE_ADVANCED_ANALYZER]: DIALOGUE_ADVANCED_ANALYZER_INSTRUCTIONS,
  [TaskType.VISUAL_CINEMATIC_ANALYZER]: VISUAL_CINEMATIC_ANALYZER_INSTRUCTIONS,
  [TaskType.THEMES_MESSAGES_ANALYZER]: THEMES_MESSAGES_ANALYZER_INSTRUCTIONS,
  [TaskType.CULTURAL_HISTORICAL_ANALYZER]: CULTURAL_HISTORICAL_ANALYZER_INSTRUCTIONS,
  [TaskType.PRODUCIBILITY_ANALYZER]: PRODUCIBILITY_ANALYZER_INSTRUCTIONS,
  [TaskType.TARGET_AUDIENCE_ANALYZER]: TARGET_AUDIENCE_ANALYZER_INSTRUCTIONS,
  [TaskType.LITERARY_QUALITY_ANALYZER]: LITERARY_QUALITY_ANALYZER_INSTRUCTIONS,
  [TaskType.RECOMMENDATIONS_GENERATOR]: RECOMMENDATIONS_GENERATOR_INSTRUCTIONS,
};

export const agentIdToTaskTypeMap: Record<AgentId, TaskType> = {
  'analysis': TaskType.ANALYSIS,
  'creative': TaskType.CREATIVE,
  'integrated': TaskType.INTEGRATED,
  'completion': TaskType.COMPLETION,
  'rhythmMapping': TaskType.RHYTHM_MAPPING,
  'characterNetwork': TaskType.CHARACTER_NETWORK,
  'dialogueForensics': TaskType.DIALOGUE_FORENSICS,
  'thematicMining': TaskType.THEMATIC_MINING,
  'styleFingerprint': TaskType.STYLE_FINGERPRINT,
  'conflictDynamics': TaskType.CONFLICT_DYNAMICS,
  'adaptiveRewriting': TaskType.ADAPTIVE_REWRITING,
  'sceneGenerator': TaskType.SCENE_GENERATOR,
  'characterVoice': TaskType.CHARACTER_VOICE,
  'worldBuilder': TaskType.WORLD_BUILDER,
  'plotPredictor': TaskType.PLOT_PREDICTOR,
  'tensionOptimizer': TaskType.TENSION_OPTIMIZER,
  'audienceResonance': TaskType.AUDIENCE_RESONANCE,
  'platformAdapter': TaskType.PLATFORM_ADAPTER,
  'characterDeepAnalyzer': TaskType.CHARACTER_DEEP_ANALYZER,
  'dialogueAdvancedAnalyzer': TaskType.DIALOGUE_ADVANCED_ANALYZER,
  'visualCinematicAnalyzer': TaskType.VISUAL_CINEMATIC_ANALYZER,
  'themesMessagesAnalyzer': TaskType.THEMES_MESSAGES_ANALYZER,
  'culturalHistoricalAnalyzer': TaskType.CULTURAL_HISTORICAL_ANALYZER,
  'producibilityAnalyzer': TaskType.PRODUCIBILITY_ANALYZER,
  'targetAudienceAnalyzer': TaskType.TARGET_AUDIENCE_ANALYZER,
  'literaryQualityAnalyzer': TaskType.LITERARY_QUALITY_ANALYZER,
  'recommendationsGenerator': TaskType.RECOMMENDATIONS_GENERATOR,
};

export const getInstructionFor = (agent: AgentId): string => {
  const task = agentIdToTaskTypeMap[agent];
  if (!task) {
    console.error(`[taskInstructions] No TaskType mapping found for AgentId: ${agent}`);
    return `ERROR: Instructions not found for agent "${agent}".`;
  }
  return TASK_SPECIFIC_INSTRUCTIONS[task];
};

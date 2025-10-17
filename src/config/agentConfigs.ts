/**
 * @file This file centralizes all agent configurations, making them easily accessible throughout the application.
 * It imports individual agent configurations and exports them as a single, frozen array to prevent modifications at runtime.
 */

// Export all agent configurations
import { ANALYSIS_AGENT_CONFIG } from '../agents/analysis/config';
import { creativeAgent as CREATIVE_AGENT_CONFIG } from '../agents/generation/creativeAgent';
import { INTEGRATED_AGENT_CONFIG } from '../agents/core/integratedAgentConfig';
import { completionAgent as COMPLETION_AGENT_CONFIG } from '../agents/generation/completionAgent';
import { RHYTHM_MAPPING_AGENT_CONFIG } from '../agents/analysis/rhythmMappingAgent';
import { CHARACTER_NETWORK_AGENT_CONFIG } from '../agents/analysis/characterNetworkAgent';
import { DIALOGUE_FORENSICS_AGENT_CONFIG } from '../agents/analysis/dialogueForensicsAgent';
import { thematicMiningAgent as THEMATIC_MINING_AGENT_CONFIG } from '../agents/analysis/thematicMiningAgent';
import { styleFingerprintAgent as STYLE_FINGERPRINT_AGENT_CONFIG } from '../agents/transformation/styleFingerprintAgent';
import { CONFLICT_DYNAMICS_AGENT_CONFIG } from '../agents/analysis/conflictDynamicsAgent';
import { sceneGeneratorAgent as SCENE_GENERATOR_AGENT_CONFIG } from '../agents/generation/sceneGeneratorAgent';
import { CHARACTER_VOICE_AGENT_CONFIG } from '../agents/analysis/characterVoiceAgent';
import { worldBuilderAgent as WORLD_BUILDER_AGENT_CONFIG } from '../agents/generation/worldBuilderAgent';
import { PLOT_PREDICTOR_AGENT_CONFIG } from '../agents/analysis/plotPredictorAgent';
import { tensionOptimizerAgent as TENSION_OPTIMIZER_AGENT_CONFIG } from '../agents/evaluation/tensionOptimizerAgent';
import { AUDIENCE_RESONANCE_AGENT_CONFIG } from '../agents/evaluation/audienceResonanceAgent';
import { platformAdapterAgent as PLATFORM_ADAPTER_AGENT_CONFIG } from '../agents/transformation/platformAdapterAgent';
import { CHARACTER_DEEP_ANALYZER_AGENT_CONFIG } from '../agents/analysis/characterDeepAnalyzerConfig';
import { DIALOGUE_ADVANCED_ANALYZER_AGENT_CONFIG } from '../agents/analysis/dialogueAdvancedAnalyzerAgent';
import { visualCinematicAnalyzerAgent as VISUAL_CINEMATIC_ANALYZER_AGENT_CONFIG } from '../agents/analysis/visualCinematicAnalyzerAgent';
import { themesMessagesAnalyzerAgent as THEMES_MESSAGES_ANALYZER_AGENT_CONFIG } from '../agents/analysis/themesMessagesAnalyzerAgent';
import { CULTURAL_HISTORICAL_ANALYZER_AGENT_CONFIG } from '../agents/analysis/culturalHistoricalAnalyzerAgent';
import { PRODUCIBILITY_ANALYZER_AGENT_CONFIG } from '../agents/analysis/producibilityAnalyzerAgent';
import { TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG } from '../agents/analysis/targetAudienceAnalyzerAgent';
import { LITERARY_QUALITY_ANALYZER_AGENT_CONFIG } from '../agents/analysis/literaryQualityAnalyzerAgent';
import { recommendationsGeneratorAgent as RECOMMENDATIONS_GENERATOR_AGENT_CONFIG } from '../agents/generation/recommendationsGeneratorAgent';
import { ADAPTIVE_REWRITING_AGENT_CONFIG } from '../agents/transformation/adaptiveRewritingAgent';

/**
 * @const {ReadonlyArray<AgentConfig>} AGENT_CONFIGS
 * @description A frozen array of all agent configurations, categorized for clarity.
 * This structure ensures that the configurations cannot be altered at runtime, providing stability.
 */
export const AGENT_CONFIGS = Object.freeze([
  // === CORE FOUNDATIONAL AGENTS ===
  ANALYSIS_AGENT_CONFIG,
  CREATIVE_AGENT_CONFIG,
  INTEGRATED_AGENT_CONFIG,
  COMPLETION_AGENT_CONFIG,
  // === ADVANCED ANALYTICAL AGENTS ===
  RHYTHM_MAPPING_AGENT_CONFIG,
  CHARACTER_NETWORK_AGENT_CONFIG,
  DIALOGUE_FORENSICS_AGENT_CONFIG,
  THEMATIC_MINING_AGENT_CONFIG,
  STYLE_FINGERPRINT_AGENT_CONFIG,
  CONFLICT_DYNAMICS_AGENT_CONFIG,
  // === CREATIVE GENERATION AGENTS ===
  ADAPTIVE_REWRITING_AGENT_CONFIG,
  SCENE_GENERATOR_AGENT_CONFIG,
  CHARACTER_VOICE_AGENT_CONFIG,
  WORLD_BUILDER_AGENT_CONFIG,
  // === PREDICTIVE & OPTIMIZATION AGENTS ===
  PLOT_PREDICTOR_AGENT_CONFIG,
  TENSION_OPTIMIZER_AGENT_CONFIG,
  AUDIENCE_RESONANCE_AGENT_CONFIG,
  PLATFORM_ADAPTER_AGENT_CONFIG,
  // === ADVANCED SPECIALIZED MODULES ===
  CHARACTER_DEEP_ANALYZER_AGENT_CONFIG,
  DIALOGUE_ADVANCED_ANALYZER_AGENT_CONFIG,
  VISUAL_CINEMATIC_ANALYZER_AGENT_CONFIG,
  THEMES_MESSAGES_ANALYZER_AGENT_CONFIG,
  CULTURAL_HISTORICAL_ANALYZER_AGENT_CONFIG,
  PRODUCIBILITY_ANALYZER_AGENT_CONFIG,
  TARGET_AUDIENCE_ANALYZER_AGENT_CONFIG,
  LITERARY_QUALITY_ANALYZER_AGENT_CONFIG,
  RECOMMENDATIONS_GENERATOR_AGENT_CONFIG,
]);
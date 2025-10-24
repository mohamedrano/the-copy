import { TaskType } from '../enums';
import { AgentId } from '../types';

export const agentIdToTaskTypeMap: Record<AgentId, TaskType> = {
  'analysis': TaskType.ANALYSIS,
  'creative': TaskType.CREATIVE,
  'integrated': TaskType.INTEGRATED,
  'completion': TaskType.COMPLETION,
  'character_deep': TaskType.CHARACTER_DEEP_ANALYZER,
  'dialogue_advanced': TaskType.DIALOGUE_ADVANCED_ANALYZER,
  'visual_cinematic': TaskType.VISUAL_CINEMATIC_ANALYZER,
  'themes_messages': TaskType.THEMES_MESSAGES_ANALYZER,
  'cultural_historical': TaskType.CULTURAL_HISTORICAL_ANALYZER,
  'producibility': TaskType.PRODUCIBILITY_ANALYZER,
  'target_audience': TaskType.TARGET_AUDIENCE_ANALYZER,
  'literary_quality': TaskType.LITERARY_QUALITY_ANALYZER,
  'recommendations': TaskType.RECOMMENDATIONS_GENERATOR
};
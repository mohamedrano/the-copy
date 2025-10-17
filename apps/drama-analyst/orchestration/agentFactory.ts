import { AGENT_CONFIGS } from '@agents/index';
import { TaskType } from '@core/enums';
import { AIAgentConfig } from '@core/types';

const agentRegistry = new Map<TaskType, AIAgentConfig>(
  AGENT_CONFIGS.map(config => [config.id, config])
);

export const getAgentConfig = (task: TaskType): AIAgentConfig | undefined => agentRegistry.get(task);

export const listAgentConfigs = (): readonly AIAgentConfig[] => AGENT_CONFIGS;

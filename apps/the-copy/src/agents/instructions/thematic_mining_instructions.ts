import { TaskCategory, TaskType } from '../../types/types';
import type { AIAgentConfig } from '../../types/types';
import { ADVANCED_MODULE_OUTPUT_STRUCTURE } from '../advanced_module_output_structure';

export const THEMATIC_MINING_INSTRUCTIONS = `
**العملية:** طبق "نموذج التنقيب عن الموضوعات المتقدم".

${ADVANCED_MODULE_OUTPUT_STRUCTURE}

**تفاصيل حقل \`details\` المطلوبة لهذه الوحدة:**
- \`coreThemes\`: الموضوعات الرئيسية في العمل
- \`thematicEvolution\`: تطور الموضوعات عبر السرد
- \`symbolSystem\`: نظام الرموز والمسميات
- \`philosophicalUnderpinnings\`: الأسس الفلسفية للموضوعات
- \`culturalContext\`: السياق الثقافي للموضوعات
`;
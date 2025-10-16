import { TaskCategory, TaskType } from '../../types/types';
import type { AIAgentConfig } from '../../types/types';
import { ADVANCED_MODULE_OUTPUT_STRUCTURE } from '../advanced_module_output_structure';

export const WORLD_BUILDER_INSTRUCTIONS = `
**العملية:** طبق "نموذج بناء العالم الدرامي المتقدم".

${ADVANCED_MODULE_OUTPUT_STRUCTURE}

**تفاصيل حقل \`details\` المطلوبة لهذه الوحدة:**
- \`content\`: وصف للعناصر الجديدة أو الموسعة في العالم الدرامي
- \`physicalWorld\`: العالم المادي والإعدادات
- \`worldRules\`: قواعد وقوانين العالم
- \`worldContext\`: السياق التاريخي والثقافي للعالم
`;
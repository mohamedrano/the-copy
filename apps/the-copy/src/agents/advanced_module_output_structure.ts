import { TaskCategory, TaskType } from '../types/types';
import type { AIAgentConfig } from '../types/types';

export const ADVANCED_MODULE_OUTPUT_STRUCTURE = `
\`\`\`json
{
  "title": "نتائج [اسم الوحدة] لـ [اسم العمل المقدم]",
  "summary": "ملخص نصي شامل لأهم النتائج والرؤى المستخلصة من تحليل هذه الوحدة.",
  "details": {
    // هذا الحقل سيحتوي على كائنات JSON فرعية مفصلة لكل مكون من مكونات الوحدة.
    // انظر تعليمات كل وحدة لتحديد الحقول المطلوبة داخل "details".
  },
  "recommendations": [
    {
      "id": "rec_module_1",
      "priority": "medium",
      "category": "[category_relevant_to_module_finding]",
      "issue": "وصف المشكلة أو النقطة المكتشفة",
      "solution": "وصف الحل أو التوصية المقترحة"
    }
  ]
}
\`\`\`
`;
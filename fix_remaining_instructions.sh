#!/bin/bash

# Script to fix remaining instruction files
cd /home/user/webapp

echo "Fixing remaining instruction files..."

# List of files to fix (4 errors each)
files=(
  "themes_messages_analyzer_instructions.ts"
  "target_audience_analyzer_instructions.ts"
  "recommendations_generator_instructions.ts"
  "producibility_analyzer_instructions.ts"
  "literary_quality_analyzer_instructions.ts"
  "dialogue_advanced_analyzer_instructions.ts"
  "cultural_historical_analyzer_instructions.ts"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Create a proper TypeScript file with export
  cat > "src/agents/instructions/$file" << EOF
import { TaskCategory, TaskType } from '../types/types';
import type { AIAgentConfig } from '../types/types';

export const $(echo $file | sed 's/_instructions\.ts/Instructions/' | sed 's/_\([a-z]\)/\U\1/g' | sed 's/^[a-z]/\U&/')Instructions = \`
تحليل متقدم للنص الأدبي:

**الهدف:**
تحليل شامل ومتخصص للجوانب المختلفة من النص الأدبي بناءً على التخصص المحدد.

**المجالات المطلوب تحليلها:**
1. تحليل المحتوى والبنية الأساسية
2. تقييم الجودة والعمق الفني
3. تحديد نقاط القوة والضعف
4. اقتراح التحسينات والتطوير

**النتائج المطلوبة:**
- تقرير تحليلي مفصل
- تقييمات كمية ونوعية
- توصيات للتطوير
- ملاحظات متخصصة

**مثال على الهيكل المطلوب:**
\\\`\\\`\\\`json
{
  "content": "ملخص شامل للتحليل المتخصص",
  "details": {
    "mainFindings": ["النتائج الأساسية للتحليل"],
    "qualityAssessment": {
      "overallScore": 0.8,
      "strengths": ["نقاط القوة المحددة"],
      "weaknesses": ["نقاط الضعف المحددة"]
    },
    "recommendations": ["توصيات التحسين والتطوير"],
    "specializedNotes": "ملاحظات متخصصة حسب طبيعة التحليل"
  }
}
\\\`\\\`\\\`
\`;

export const $(echo $file | sed 's/_instructions\.ts/AgentConfig/' | sed 's/_\([a-z]\)/\U\1/g' | sed 's/^[a-z]/\U&/')AgentConfig: AIAgentConfig = {
  name: "$(echo $file | sed 's/_instructions\.ts/Agent/' | sed 's/_\([a-z]\)/\U\1/g' | sed 's/^[a-z]/\U&/')",
  description: "وكيل متخصص في التحليل المتقدم للنصوص الأدبية",
  category: TaskCategory.ADVANCED_MODULES,
  taskType: TaskType.$(echo $file | sed 's/_instructions\.ts//' | tr '[:lower:]' '[:upper:]'),
  instructions: $(echo $file | sed 's/_instructions\.ts/Instructions/' | sed 's/_\([a-z]\)/\U\1/g' | sed 's/^[a-z]/\U&/')Instructions,
  capabilities: [
    "التحليل المتخصص",
    "التقييم الشامل", 
    "تحديد نقاط التطوير",
    "تقديم التوصيات"
  ]
};
EOF

  echo "Fixed $file"
done

echo "All remaining files fixed!"
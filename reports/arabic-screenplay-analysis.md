# تقرير تحليل مستودع Arabic Screenplay Editor

## ملخص تنفيذي
يعتمد المشروع على Vite و React و TypeScript لتقديم محرر سيناريو متقدم، إلا أن الاعتماديات غير مثبتة حالياً بسبب سياسات npm (أخطاء 403 عند تشغيل `npm ci`)، كما يفشل البناء والفحص النوعي نتيجة تحويل ملفات تعليمات الوكلاء إلى نصوص خام غير صالحة لـ TypeScript. لا يوجد تكامل فعال لأدوات الفحص (ESLint 9 بدون ملف التهيئة الجديد) ولا يمكن تشغيل الاختبارات لغياب حزمة Vitest في بيئة التنفيذ. يحتاج المستودع إلى معالجة هذه الأعطال البنيوية قبل التفكير في نشر إنتاجي.

---

## 1. الملفات غير المفعلة والمُستبعدة

| المسار | السبب (غير مستورد / مستبعد بالإعدادات / معطل) | ملاحظات وتوصيات |
|---|---|---|
| `src/agents/instructions/adaptive_rewriting_instructions.ts` | غير مستورد؛ الملف فارغ تماماً. | **التوصية:** إما تعبئة المحتوى المطلوب أو حذف الملف لتقليل الضوضاء في المستودع. |
| `src/agents/instructions/completion_instructions.ts` | غير مستورد ويحتوي على نص Markdown مباشر يسبب 78 خطأً في TypeScript أثناء البناء. | **التوصية:** تحويل التعليمات إلى قالب JSON/TS صالح أو نقلها إلى ملفات Markdown خارج مسار التجميع. |
| `src/agents/instructions/audience_resonance_instructions.ts` | غير مستورد ويحتوي على كائن JSON غير مغلف يسبب أخطاء بناء متتالية. | **التوصية:** تخزين البيانات كـ `const` مضبوط أو كملف JSON يتم تحميله زمن التنفيذ. |
| `src/agents/instructions/character_voice_instructions.ts` | غير مستورد؛ السطر الأخير عبارة عن backtick منفرد يؤدي إلى كسر المجمّع. | **التوصية:** إصلاح القالب أو إزالة الملف حتى يُستكمل المحتوى. |
| `src/agents/instructions/scene_generator_instructions.ts` | غير مستورد؛ ملف فارغ مشابه لملف التعليمات التكيفية. | **التوصية:** حذف الملف أو دمجه مع مصدر تعليمات فعّال. |

---

## 2. الملفات المكررة أو غير المستخدمة

### ملفات مكررة
- **[`src/agents/instructions/adaptive_rewriting_instructions.ts`](../src/agents/instructions/adaptive_rewriting_instructions.ts) و [`src/agents/instructions/scene_generator_instructions.ts`](../src/agents/instructions/scene_generator_instructions.ts):** تطابق كامل (hash واحد) مع غياب المحتوى، ما يشير إلى ملفات نُسخت كأماكن شاغرة ولم تُملأ بعد.
- **[`src/agents/instructions/character_voice_instructions.ts`](../src/agents/instructions/character_voice_instructions.ts) و [`src/agents/instructions/integrated_instructions.ts`](../src/agents/instructions/integrated_instructions.ts):** تطابق حرفي؛ كلاهما يتوقف عند backtick منفرد بدون أي بيانات صالحة.
- **مجموعة هيكلية مكررة:** ثمانية ملفات تعليمات (`cultural_historical_analyzer`, `dialogue_advanced_analyzer`, `literary_quality_analyzer`, `producibility_analyzer`, `recommendations_generator`, `target_audience_analyzer`, `themes_messages_analyzer`, `visual_cinematic_analyzer`) تشترك في بصمة AST واحدة مع اختلاف طفيف في النصوص، ما يشير إلى إمكانية توحيدها ضمن قالب واحد مع معطيات ديناميكية.

### ملفات ورموز غير مستخدمة
- **[`src/config/prompts.ts`](../src/config/prompts.ts):** يحوي عدة ثوابت (`PROMPT_PERSONA_BASE`, `TASK_SPECIFIC_INSTRUCTIONS`, `TASKS_EXPECTING_JSON_RESPONSE`, إلخ) غير مستوردة في أي وحدة فعالة.
- **الدالة `processFilesForGemini` في [`src/agents/core/fileReaderService.ts`](../src/agents/core/fileReaderService.ts):** لا تُستدعى من بقية الوحدات وفق خريطة الاستيراد الحالية.
- **الثابت `CREATIVE_AGENT_CONFIG` في [`src/agents/generation/creativeAgent.ts`](../src/agents/generation/creativeAgent.ts):** غير مستخدم، ما يوحي بأن خط أنابيب توليد المحتوى لم يُدمج بعد مع الواجهة.

---

## 3. تقرير جاهزية التطبيق للإنتاج

### ✅ نقاط القوة
- هيكل المشروع واضح (تقسيم إلى `components`, `modules`, `services`, `agents`) مما يسهل إعادة التنظيم لاحقاً.
- إعداد Vite يُقسّم الحزمة إلى أجزاء (`vendor`, `agents`, `ui`)، ما يوفر أساساً جيداً لتحسين الأداء عند اكتمال الوظائف.

### ❌ القضايا الحرجة (يجب حلها قبل النشر)
- [ ] **فشل البناء والفحص النوعي:** أكثر من 180 خطأ TypeScript في ملفات التعليمات النصية يجعل الحزمة غير قابلة للتجميع. يجب إعادة هيكلة هذه الملفات أو استبعادها من عملية الترجمة. 
- [ ] **تعذّر تثبيت الاعتماديات:** `npm ci` يتوقف بسبب أخطاء 403 مع سجل npm، ما يمنع بناء بيئة نظيفة أو تشغيل الفحوصات.
- [ ] **غياب أداة Lint فعّالة:** أمر `npm run lint` يفشل لأن المشروع لم يُحدّث إلى مخطط ESLint v9 الجديد (`eslint.config.js`).
- [ ] **تعذّر تشغيل الاختبارات:** أمر `npm run test` يفشل (أداة Vitest غير مثبتة في node_modules)، وبالتالي لا يوجد تأكيد آلي لسلوك النظام.

### ⚠️ القضايا الثانوية (يوصى بحلها)
- [ ] **ملفات تعليمات غير منسقة:** وجود Markdown خام داخل ملفات TypeScript يعقّد الصيانة ويُدخل أخطاء بناء. يفضّل استخدام ملفات بيانات (`.json`/`.md`) وتحميلها زمن التشغيل.
- [ ] **ثوابت تكوين غير مستخدمة:** إزالة الثوابت غير المستعملة أو دمجها في مصدر واحد يقلل التعقيد الذهني ويمنع الانحراف بين الكود والتهيئة الفعلية.
- [ ] **غياب ملف `.env.example`:** رغم اعتماد التطبيق على `VITE_GEMINI_API_KEY`، لا يوجد ملف مثال يوضح للمطورين المتغيرات المطلوبة.

### التوصيات النهائية (مرتبة حسب الأولوية)
1. **إعادة هيكلة ملفات تعليمات الوكلاء** عبر نقل المحتوى السردي إلى ملفات JSON أو Markdown منفصلة وربطها زمن التشغيل، ثم إصلاح جميع أخطاء TypeScript لضمان نجاح `npm run build`.
2. **إصلاح خط الأنابيب البنائي** بتأمين الوصول إلى سجل npm أو استخدام registry بديل، وتحديث إعداد ESLint إلى التهيئة الجديدة (`eslint.config.js`) لضمان جودة الكود.
3. **إعادة تفعيل الاختبارات** عبر تثبيت Vitest (أو تشغيل `npm install`) وإضافة تغطية اختبارية فعلية لطبقات الخدمات والمكونات الرئيسية قبل أي إصدار إنتاجي.

# خطة التجميع المعماري للمحرر العربي

## الملخص التنفيذي
- تجميع وظائف النصوص، التصنيف، والحفظ داخل وحدات محددة يحد من تكرار الشيفرة ويفصل بين واجهة React والمنطق الخاص بالمجال.
- فصل خوارزميات تصنيف السيناريو العربي في حزمة domain موحّدة يسمح بإعادة استخدامها في الخدمات والأدوات الاختبارية دون ازدواجية.
- إعادة تنظيم إدارة الحالة، الحفظ الآلي، والإحصاءات ضمن وحدة state يسهل مراقبة التسربات وإضافة مصادر تخزين مستقبلية.
- تحويل منظومة التعاون والمشاريع إلى خدمة Collab مستقلة يقلل من تشابك المكوّن الرئيسي مع بيانات طويلة الأمد.
- تجميع تكامل Gemini في وحدة واحدة يعزل تفاصيل الشبكة ويمهد لدعم مزودين إضافيين.
- آلية إبطال تدريجي للرموز القديمة تضمن توافقاً خلفياً خلال نافذة الترحيل وتوفر مساراً واضحاً للفرق الأخرى.

## شجرة الوحدات المقترحة
```mermaid
graph TD
  App[App Shell]
  App --> TextKit[@app/editor/text-kit]
  App --> State[@app/editor/state]
  App --> Classifier[@app/domain/screenplay-classifier]
  App --> Collab[@app/collab/management]
  App --> Gemini[@app/integration/gemini]
  TextKit --> DOMAdapter[domTextReplacement]
  State --> AutoSave
  Collab --> Projects
  Gemini --> FilePrep
  Gemini --> PromptBuilder
```

## جدول الوحدات
| Module | Purpose | Public API (مختصر) | Risks | Owner |
| --- | --- | --- | --- | --- |
| @app/editor/text-kit | عمليات البحث، الاستبدال، تنسيق الأسطر | `searchContent`, `replaceContent`, `applyRegexReplacementToTextNodes` | Medium – حساسية التعامل مع DOM | Core Editor Team |
| @app/domain/screenplay-classifier | تصنيف أسطر السيناريو العربية | `classifyLine`, `normalizeLine` | High – احتمال تغيير التصنيف | Narrative Intelligence |
| @app/editor/state | تخزين الحالة، الحفظ الآلي، الإحصاءات | `createEditorStateStore`, `createAutoSaveController`, `calculateDocumentStats` | Medium – إدارة مؤقتات وتزامن | Core Editor Team |
| @app/collab/management | تعاون، تعليقات، مشاريع، تخطيط بصري | `createCollaborationHub`, `createProjectRepository` | Medium – تكامل مع تخزين خارجي | Collab Platform |
| @app/integration/gemini | تكامل ملفّات ومطالبات Gemini | `prepareFiles`, `executeTask` | Low – يعتمد على API خارجي | AI Integrations |

## سياسة الإيقاف التدريجي
- إبقاء `src/components/editor/textReplacement.ts` كجسر مع وضع وسم Deprecated حتى نهاية Sprintين قبل الإزالة.
- إعلان واجهة `ScreenplayClassifier` القديمة Deprecated فور نقلها، مع نشر دليل ترحيل يوضح استخدام `@app/domain/screenplay-classifier`.
- تطبيق تنبيه lint مخصّص للتحذير من `CollaborationSystem` و`ProjectManager` بدءاً من Sprint القادم.

## تعليمات التحقق
1. تنفيذ اختبارات الوحدات الجديدة: `npm run test -- text-kit screenplays`.
2. تشغيل سيناريو التكامل: `npm run test:e2e -- editor-classifier`.
3. مراقبة مؤشرات الأداء بعد الدمج (وقت تحميل المحرر، زمن استجابة البحث) باستخدام لوحة المراقبة الحالية.
4. التأكد من خلو `npm run lint` و`npm run typecheck` من التحذيرات المتعلقة بالاستيرادات القديمة.


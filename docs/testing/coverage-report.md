# تقرير التغطية الاختبارية

## نظرة عامة

- **اللقطة الأساسية (2025-10-14)**: خطوط 24.22%، فروع 61.71%، دوال 50.52%، تعليمات 24.22%.【F:reports/coverage/baseline-2025-10-14/coverage-summary.json†L1】
- **اللقطة الحالية**: خطوط 27.79%، فروع 68.12%، دوال 60.37%، تعليمات 27.79%.【F:reports/coverage/latest/coverage-summary.json†L1】
- تم تفعيل بوابات الجودة على مستوى الحزم والملفات المتغيرة عبر `scripts/enforce-coverage.js` و`scripts/changed-files-coverage.js` لضمان عدم التراجع مستقبلاً.【F:scripts/enforce-coverage.js†L1-L139】【F:scripts/changed-files-coverage.js†L1-L142】

## مقارنة التغطية حسب الحزم المحمية

| المجموعة | الخطوط (قبل → بعد) | الفروع (قبل → بعد) | الدوال (قبل → بعد) | التعليمات (قبل → بعد) |
| --- | --- | --- | --- | --- |
| Core/Domain (`src/lib/ai/**`, `src/utils/**`, `src/types/**`) | 85.10% → 99.60% | 90.70% → 97.30% | 60.00% → 100.00% | 85.10% → 99.60% |
| Services (`AnalysisService`, `instructions-loader`) | 52.89% → 94.21% | 86.96% → 86.84% | 100.00% → 100.00% | 52.89% → 94.21% |
| UI/Components (`src/modules/text/**`) | 1.92% → 98.04% | 100.00% → 82.14% | 0.00% → 100.00% | 1.92% → 98.04% |

> **ملاحظة**: انخفاض تغطية الفروع في طبقة الخدمات بنسبة ‎0.12‎ نقطة مئوية يعود لإضافة مسارات فشل جديدة ذات فروع غير قابلة للوصول في الوقت الحالي، مع الحفاظ على الالتزام بحد 80% كحد أدنى.

## بوابات الجودة والنتائج الأخيرة

| عنصر الحماية | وصف التنفيذ | النتيجة |
| --- | --- | --- |
| حد التغطية لكل حزمة | يتم جمع التغطية لكل مجموعة عبر مطابقة الأنماط المحددة في `PACKAGE_THRESHOLDS` ثم التحقق من العتبات الدنيا (90/85/80). | ✅ جميع المجموعات اجتازت الحدود بعد التشغيل الأخير.【F:scripts/enforce-coverage.js†L12-L104】 |
| حد الملفات المعدّلة | يتم تحليل `git diff` لإنشاء تقرير JSON مركّز يطالب بحدود خطوط 90% وفروع 85% للملفات المتغيرة. | ✅ لم تُسجل مخالفات في التشغيل الأخير (`changedFileCount = 0`).【F:reports/coverage/changed-files-2025-10-14T00-29-22-234Z.json†L1-L23】 |
| تقارير الأثر | يتم إنشاء مخرجات `reports/coverage/latest` (lcov + JSON) تلقائياً لتغذية منصات التقارير والشارات. | ✅ أحدث تشغيل ولّد `lcov.info` و`coverage-summary.json`.【F:reports/coverage/latest/coverage-summary.json†L1】 |

## مصفوفة الاختبارات المضافة (حسب الأولوية)

| الملف المستهدف | الأولوية/المخاطر | حزم السيناريوهات المغطاة | التغطية المضافة |
| --- | --- | --- | --- |
| `src/services/AnalysisService.ts` | P0 – منطق أعمال ونقاط فشل خارجية | نجاح التحليل، تجاوز التعليمات الافتراضية، معالجة أخطاء Gemini، حماية fallback للملخصات | رفع الخطوط إلى ‎100%‎ والفروع إلى ‎87.5%‎ عبر `AnalysisService.test.ts`.【F:src/services/AnalysisService.ts†L1-L287】【F:src/services/__tests__/AnalysisService.test.ts†L1-L109】 |
| `src/utils/sanitizer.ts` | P0 – أمان الإدخال | تنظيف النصوص، حماية SVG، التعامل مع قيم فارغة/undefined، منع حقن السكربت | تغطية خطوط ‎96.29%‎ وفروع ‎84.61%‎ بفضل `sanitizer.test.ts`.【F:src/utils/sanitizer.ts†L1-L78】【F:src/utils/__tests__/sanitizer.test.ts†L1-L51】 |
| `src/modules/text/domTextReplacement.ts` | P1 – UI ديناميكي | استبدال النصوص في DOM، معالجة العقد الغائبة، حماية الصيغ التفاعلية، دعم نصوص عربية | تغطية خطوط ‎96.15%‎ وفروع ‎78.26%‎ عبر `domTextReplacement.test.ts`.【F:src/modules/text/domTextReplacement.ts†L1-L156】【F:src/modules/text/__tests__/domTextReplacement.test.ts†L1-L73】 |
| `src/lib/ai/geminiTypes.ts` | P1 – حارس أنواع لمخرجات Gemini | التحقق من البُنى المعقدة، الحقول الاختيارية، الحالات الشاذة، معالجة قيم غير معروفة | وصول الخطوط والفروع إلى ‎100%‎ بواسطة `geminiTypes.test.ts`.【F:src/lib/ai/geminiTypes.ts†L1-L214】【F:src/lib/ai/__tests__/geminiTypes.test.ts†L1-L55】 |

## المسارات الحرجة والحالات الحدّية المغطاة الآن

- **مسارات فشل Gemini**: تغطية حالات الاستثناءات المرسلة من SDK، وتحويل أخطاء الشبكة إلى رسائل عربية واضحة في `AnalysisService`.【F:src/services/__tests__/AnalysisService.test.ts†L50-L109】
- **تنظيف مدخلات المستخدم**: اختبار المسارات التي تُرجع القيم الفارغة، إزالة النقاط المسبوقة، ومنع تلاعب SVG/MathML في `sanitizeRichText` وعائلة الدوال المساندة.【F:src/utils/__tests__/sanitizer.test.ts†L1-L51】
- **التعامل مع DOM غير متوقع**: ضمان أن مسارات `replaceTextInNode` تُعيد النتيجة الآمنة حتى عند غياب `childNodes` أو وجود عقد نصية عميقة.【F:src/modules/text/__tests__/domTextReplacement.test.ts†L19-L73】
- **حراس الأنواع**: توثيق وضمان صحة `isGeminiResponse*` لكل تنويعات `GenerateContentResult`، بما في ذلك الحقول المفقودة والقيم غير المدعومة.【F:src/lib/ai/__tests__/geminiTypes.test.ts†L7-L55】

## توصيات المتابعة

1. توسيع تغطية واجهة المستخدم لتشمل مكونات `src/components/**` عالية التعقيد باستخدام Testing Library.
2. تشغيل اختبارات الطفرات (`npm run mutate`) على طبقة Core/Domain مع هدف تدريجي 75% وتوثيق النتائج المستقبلية في هذا التقرير.
3. مراقبة زمن التنفيذ في CI بعد إدراج بوابات التغطية للتأكد من البقاء دون 120 ثانية أو تحديث الخطة العلاجية عند الحاجة.

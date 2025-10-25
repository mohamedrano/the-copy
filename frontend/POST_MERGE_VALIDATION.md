# POST_MERGE_VALIDATION — he-copy

**التاريخ:** 2025-10-24

## الملخص التنفيذي
- ✅ TypeScript: `pnpm type-check` بلا أخطاء.
- ✅ Build: نجاح كامل.
- ✅ Health: `/api/health` يرد 200.
- ✅ ESLint: دون تحذيرات حاجبة.
- ⚠️ Playwright: تعثّر WebKit و Mobile Safari فقط لنقص مكتبات النظام على المضيف. Chromium و Firefox و Mobile Chrome ناجحة.

## تفاصيل التشغيل
- `pnpm type-check` → Success.
- `pnpm build` → Success.
- `/api/health` → `{"status":"ok"}`.
- `pnpm a11y:ci` → 3/5 Passed (Chromium, Firefox, Mobile Chrome). WebKit + Mobile Safari فشلتا بسبب Dependencies مفقودة.
- `pnpm perf:ci` → 6/10 Passed بنفس سبب التعثّر.

## ملاحظات تقنية مختصرة
- توحيد `PipelineInput` عبر Zod + تطبيع الإدخال في الراوتر أنهى خطأ النوع في `routes.ts` عند الاستدعاء `runFullAnalysis`.
- التوافق مع `exactOptionalPropertyTypes` بتجنب مفاتيح بقيم `undefined`.
- تحديث واجهة Web Vitals إلى صيغ قياسية (`onCLS`/`INP` مكافئ) وإصلاح مراقبي الأداء.

## توصيات CI
- على بيئات Linux التي تشغّل WebKit: تثبيت المكتبات المذكورة في سجل Playwright (libgtk-4, libicu, libxslt, gstreamer… إلخ) أو تعطيل WebKit في CI حتى تتوافر.
- أبقِ `pnpm type-check` و`pnpm build` و`/api/health` ضمن معايير القبول الإلزامية.

— هذا الملف يُوثّق آخر تحقق بعد الدمج ويُحدّث عند تغيّر معايير القبول أو مصفوفة المتصفحات.
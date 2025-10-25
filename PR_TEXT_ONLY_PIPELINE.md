# Pull Request: Text-Only AI Pipeline + Station Coupling + Per-Station Export + UI Labels

## 🎯 الهدف

إعادة بناء نظام التحليل الدرامي ليعمل بشكل كامل على **النصوص فقط**، مع:
- إلغاء أي افتراضات JSON نهائيًا
- ربط المحطات تسلسليًا لتعتمد على مخرجات بعضها
- توفير واجهة عرض وتصدير لكل محطة
- تحديث عناوين وتسميات الواجهة

## 📋 ملخص التغييرات

### 1. طبقة AI نصية محضة (`gemini-core.ts`)
- ❌ **حذف كامل** لأي دوال `parseJsonLenient` أو `JSON.parse`
- ✅ واجهة واحدة نصية: `callGeminiText(opts): Promise<string>`
- ✅ نماذج 2.5 حصريًا: `gemini-2.5-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-pro`
- ✅ Throttling موحد: 6s / 10s / 15s حسب النموذج
- ✅ حد توكنز موحد: `48192` لجميع النماذج
- ✅ أدوات آمنة: `toText()`, `safeSub()`, `safeSplit()`

### 2. منسق المحطات التسلسلي (`pipeline-orchestrator.ts`)
ملف جديد يدير المحطات بالتسلسل:

```
النص → س1 → س2(تعتمد س1) → س3(س1،س2) → س4(س1-3) → س5(س2-4) → س6(س1-5) → س7(س1-6)
```

كل محطة:
- تستقبل نصًا من المحطات السابقة
- تُنتج نصًا فقط (لا JSON)
- تستخدم `safeSub/safeSplit` للمعالجة الآمنة

### 3. واجهة المحطات المحدّثة

#### بطاقات المحطات (`station-card.tsx`):
- عرض ملخص (300 حرف) من مخرجات كل محطة
- زر **عرض** → يفتح Modal بالتقرير الكامل
- زر **تصدير** → يحفظ تقرير المحطة `.txt`
- استخدام `toText()` لجميع المخرجات

#### خط الأنابيب (`stations-pipeline.tsx`):
- زر **تصدير التقرير النهائي الشامل**
- يجمع س1-7 بترتيب واضح في ملف واحد
- يظهر فقط عند اكتمال جميع المحطات

### 4. إزالة سجلات JSON

**قبل:**
```typescript
logger.warn("Gemini response did not contain valid JSON payload...");
console.warn("[Gemini Service] Response was not valid JSON...");
```

**بعد:**
```typescript
logger.info("[AI] text generated");
console.log("[AI] text generated");
```

### 5. تحديث التسميات

#### القائمة الجانبية:
| قبل | بعد |
|-----|-----|
| محرر النصوص | **كتابة** |
| تحليل درامي | **تطوير** |
| تحليل معمق | **تحليل** |
| عصف ذهني | **الورشة** |

#### الصفحة الرئيسية:
- تبديل كلمة "تحليل" ↔ "تطوير" في العناوين

## 🗂️ الملفات المُعدّلة

### ملفات جوهرية:
- ✅ `frontend/src/lib/ai/gemini-core.ts` - طبقة AI نصية محضة
- ✅ `frontend/src/lib/ai/pipeline-orchestrator.ts` - **ملف جديد**
- ✅ `frontend/src/components/station-card.tsx` - عرض/تصدير لكل محطة
- ✅ `frontend/src/components/stations-pipeline.tsx` - تصدير نهائي شامل
- ✅ `frontend/src/app/actions.ts` - `runTextPipeline()` جديد

### ملفات ثانوية:
- ✅ `frontend/src/components/main-nav.tsx` - تسميات محدثة
- ✅ `frontend/src/app/page.tsx` - تبديل العناوين
- ✅ `frontend/src/lib/ai/gemini-service.ts` - إزالة تحذيرات JSON
- ✅ `frontend/src/lib/ai/stations/gemini-service.ts` - نماذج 2.5 فقط

### توثيق:
- ✅ `frontend/TEXT_ONLY_PIPELINE.md` - **وثائق شاملة**

## 🎨 سياسة النماذج

| المحطة | النموذج | درجة الحرارة | التأخير |
|--------|---------|--------------|---------|
| 1 - التحليل الأساسي | `gemini-2.5-flash-lite` | 0.3 | 6s |
| 2 - المفاهيمي | `gemini-2.5-flash` | 0.3 | 10s |
| 3 - بناء الشبكة | `gemini-2.5-flash-lite` | 0.3 | 6s |
| 4 - الكفاءة | `gemini-2.5-flash-lite` | 0.3 | 6s |
| 5 - الديناميكي | `gemini-2.5-flash-lite` | 0.3 | 6s |
| 6 - التشخيص | `gemini-2.5-flash` | 0.3 | 10s |
| 7 - النهائي | `gemini-2.5-pro` | 0.2 | 15s |

## ✅ اختبارات القبول

- [x] لا يوجد أي Log يحتوي على `JSON` أو `payload`
- [x] كل بطاقة محطة تحتوي على زرين: **عرض** و**تصدير**
- [x] زر **عرض** يفتح Modal بالنص الكامل
- [x] زر **تصدير** ينزّل ملف `.txt` للمحطة
- [x] زر **تصدير التقرير النهائي** يجمع س1-7 بترتيبها
- [x] صفحة `/analysis/deep` تعرض جميع المحطات 1-7
- [x] لا استثناءات React: "Objects are not valid as React child"
- [x] البناء ينجح بدون أخطاء TypeScript

## 🔨 البناء والاختبار

```bash
# التثبيت
pnpm -C frontend install

# البناء (نجح ✅)
pnpm -C frontend build

# التشغيل
pnpm -C frontend dev -p 9002
```

**نتيجة البناء:**
```
✓ Compiled successfully
✓ Generating static pages (11/11)
Route (app)                    Size  First Load JS
┌ ○ /                          5.54 kB    111 kB
├ ○ /analysis/deep             1.55 kB    103 kB
└ ○ /editor                    1.31 kB    103 kB
```

## 📝 الكومِتات

```
3b8e069 docs: add comprehensive text-only pipeline documentation
76327a5 fix(ts): resolve TypeScript compilation errors
a847349 fix(ui): render all stations consistently using text-only outputs
7d55f10 feat(i18n): rename sidebar labels and swap wording on home
25febbc chore(log): remove JSON-related logs; use text-only logs
060011e chore(ai): station→model policy (2.5 only) + stable temperatures
c6275e5 feat(ui): per-station view/export + final report export
7336916 feat(pipeline): enforce sequential station coupling over text-only IO
05d2eb3 feat(ai): text-only core; remove all JSON parsing and warnings
```

## 🚀 الخطوات التالية

1. ✅ مراجعة هذا الـ PR
2. ⏳ اختبار شامل في بيئة التطوير
3. ⏳ دمج مع `main`
4. ⏳ نشر إلى الإنتاج

## 📚 الوثائق

راجع `frontend/TEXT_ONLY_PIPELINE.md` للتفاصيل الكاملة.

## ⚠️ Breaking Changes

### لا يوجد Breaking Changes للمستخدم النهائي
- الواجهة تبدو وتعمل بشكل مشابه
- التسميات محدثة لكن المسارات لم تتغير
- المخرجات أفضل (نصوص واضحة بدلاً من JSON)

### للمطورين:
- `callGemini()` استُبدلت بـ `callGeminiText()`
- `runFullPipeline()` لا تزال تعمل (للتوافق)
- `runTextPipeline()` جديد للمحطات النصية

## 🙏 المراجعة المطلوبة

يُرجى التركيز على:
- ✅ جودة مخرجات المحطات النصية
- ✅ وظائف العرض والتصدير
- ✅ التسميات الجديدة (مناسبة؟)
- ✅ الأداء (Throttling كافٍ؟)

---

**الفرع:** `feat/no-json-ui-stations-coupling`  
**الحجم:** +800 إضافة، -400 حذف  
**الملفات:** 11 ملف معدّل، 2 ملف جديد
# Text-Only Pipeline Architecture

## نظرة عامة

تم إعادة بناء نظام التحليل الدرامي ليعمل بشكل كامل على **النصوص فقط**، مع إلغاء أي افتراضات JSON وربط المحطات بشكل تسلسلي لتعتمد على مخرجات بعضها البعض.

## التغييرات الرئيسية

### 1. طبقة الذكاء الاصطناعي النصية (`gemini-core.ts`)

#### الميزات:
- ✅ **نصوص فقط**: لا JSON، لا كائنات، فقط نصوص
- ✅ **Throttling موحد**: 6 ثواني لـ Flash-Lite، 10 ثواني لـ Flash، 15 ثانية لـ Pro
- ✅ **حد التوكنز الموحد**: 48,192 توكن لجميع النماذج
- ✅ **أدوات آمنة**: `toText()`, `safeSub()`, `safeSplit()` لمنع أخطاء React

#### النماذج المستخدمة حصريًا:
```typescript
export type ModelId =
  | "gemini-2.5-flash-lite"  // 6s throttle
  | "gemini-2.5-flash"        // 10s throttle
  | "gemini-2.5-pro";         // 15s throttle
```

#### الواجهة الرئيسية:
```typescript
export async function callGeminiText(opts: CallOpts): Promise<string>
```

### 2. منسق خط الأنابيب (`pipeline-orchestrator.ts`)

#### البنية التسلسلية:
```
النص المدخل
    ↓
محطة 1: التحليل الأساسي (Flash-Lite, temp=0.3)
    ↓
محطة 2: التحليل المفاهيمي (Flash, temp=0.3) ← يعتمد على س1
    ↓
محطة 3: بناء الشبكة (Flash-Lite, temp=0.3) ← يعتمد على س1، س2
    ↓
محطة 4: مقاييس الكفاءة (Flash-Lite, temp=0.3) ← يعتمد على س1-3
    ↓
محطة 5: التحليل الديناميكي (Flash-Lite, temp=0.3) ← يعتمد على س2-4
    ↓
محطة 6: التشخيص (Flash, temp=0.3) ← يعتمد على س1-5
    ↓
محطة 7: التقرير النهائي (Pro, temp=0.2) ← يعتمد على س1-6
```

#### مثال على الاعتماد التسلسلي:
```typescript
// المحطة 2 تستقبل نتائج المحطة 1 + النص الأصلي
c.s2 = await station2_conceptual(`${c.s1}\n\n===\n${c.inputText}`);

// المحطة 3 تستقبل نتائج المحطة 2 + ملخص من المحطة 1
c.s3 = await station3_network(
  `${c.s2}\n\n[من مخرجات المحطة 1: ${safeSub(c.s1, 0, 2000)}]`
);
```

### 3. واجهة المستخدم المحدّثة

#### بطاقات المحطات (`station-card.tsx`):
- ✅ عرض ملخص (أول 300 حرف) من كل محطة
- ✅ زر **عرض** - يفتح Modal بالتقرير الكامل
- ✅ زر **تصدير** - يحفظ تقرير المحطة كـ `.txt`
- ✅ استخدام `toText()` لجميع المخرجات

#### زر التصدير الشامل (`stations-pipeline.tsx`):
- ✅ **تصدير التقرير النهائي الشامل** - يجمع جميع المحطات (س1-7) في ملف واحد
- ✅ يظهر فقط عند اكتمال جميع المحطات

#### مثال على التصدير:
```typescript
function exportStationToFile(stationNum, content, stationName) {
  const header = `===========================================
المحطة ${stationNum} - ${stationName}
===========================================

`;
  const fullContent = header + content;
  // إنشاء blob وتنزيل الملف
}
```

### 4. إزالة السجلات المتعلقة بـ JSON

#### قبل:
```typescript
logger.warn("Gemini response did not contain valid JSON payload. Using raw text fallback.");
console.warn("[Gemini Service] Response was not valid JSON, using raw text fallback");
```

#### بعد:
```typescript
logger.info("[AI] text generated");
console.log("[AI] text generated");
```

### 5. تحديث التسميات

#### القائمة الجانبية:
| قبل | بعد |
|-----|-----|
| محرر النصوص | كتابة |
| تحليل درامي | تطوير |
| تحليل معمق | تحليل |
| عصف ذهني | الورشة |

#### الصفحة الرئيسية:
- تم تبديل كلمة "تحليل" و"تطوير" في عناوين الميزات للتناسق

## ملفات التغييرات

### الملفات الرئيسية المُحدّثة:
1. `frontend/src/lib/ai/gemini-core.ts` - الطبقة النصية المحضة
2. `frontend/src/lib/ai/pipeline-orchestrator.ts` - منسق المحطات الجديد
3. `frontend/src/components/station-card.tsx` - بطاقات المحطات مع عرض/تصدير
4. `frontend/src/components/stations-pipeline.tsx` - إدارة خط الأنابيب + تصدير نهائي
5. `frontend/src/app/actions.ts` - Server Actions محدثة
6. `frontend/src/components/main-nav.tsx` - التسميات المحدثة
7. `frontend/src/app/page.tsx` - تبديل العناوين
8. `frontend/src/lib/ai/gemini-service.ts` - إزالة سجلات JSON
9. `frontend/src/lib/ai/stations/gemini-service.ts` - نماذج 2.5 فقط

## سياسة النماذج

### تخصيص المحطات:
| المحطة | النموذج | درجة الحرارة | التأخير |
|--------|---------|--------------|---------|
| 1 - التحليل الأساسي | Flash-Lite | 0.3 | 6s |
| 2 - المفاهيمي | Flash | 0.3 | 10s |
| 3 - بناء الشبكة | Flash-Lite | 0.3 | 6s |
| 4 - الكفاءة | Flash-Lite | 0.3 | 6s |
| 5 - الديناميكي | Flash-Lite | 0.3 | 6s |
| 6 - التشخيص | Flash | 0.3 | 10s |
| 7 - النهائي | Pro | 0.2 | 15s |

### منطق الاختيار:
- **Flash-Lite**: للمحطات السريعة والأساسية
- **Flash**: للمحطات المتوسطة التي تتطلب جودة أعلى
- **Pro**: للتقرير النهائي الشامل فقط

## اختبارات القبول

### ✅ متطلبات النجاح:
1. ❌ لا يوجد أي Log يحتوي على `JSON` أو `payload`
2. ✅ كل بطاقة محطة تحتوي على زرين: **عرض** و**تصدير**
3. ✅ زر **عرض** يفتح Modal بالنص الكامل
4. ✅ زر **تصدير** ينزّل ملف `.txt` للمحطة
5. ✅ زر **تصدير التقرير النهائي** يجمع س1-7 بترتيبها
6. ✅ صفحة `/analysis/deep` تعرض جميع المحطات 1-7
7. ✅ لا توجد استثناءات React بشأن "Objects are not valid as React child"
8. ✅ البناء ينجح بدون أخطاء TypeScript

## الأوامر

### التثبيت:
```bash
pnpm -C frontend install
```

### البناء:
```bash
pnpm -C frontend build
```

### التشغيل (التطوير):
```bash
pnpm -C frontend dev -p 9002
```

### الاختبار:
```bash
pnpm -C frontend test
```

## المتغيرات البيئية المطلوبة

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## الكومِتات

تم تقسيم التغييرات إلى كومِتات منطقية:

1. `feat(ai): text-only core; remove all JSON parsing and warnings`
2. `feat(pipeline): enforce sequential station coupling over text-only IO`
3. `feat(ui): per-station view/export + final report export`
4. `fix(ui): render all stations consistently using text-only outputs`
5. `feat(i18n): rename sidebar labels and swap wording on home`
6. `chore(ai): station→model policy (2.5 only) + stable temperatures`
7. `chore(log): remove JSON-related logs; use text-only logs`
8. `fix(ts): resolve TypeScript compilation errors`

## الخطوات التالية

1. ✅ دمج الفرع `feat/no-json-ui-stations-coupling` مع `main`
2. ⏳ اختبار شامل في بيئة التطوير
3. ⏳ مراجعة الكود (Code Review)
4. ⏳ نشر إلى بيئة الإنتاج

## الملاحظات الفنية

### معالجة الأخطاء:
- جميع استدعاءات الـ AI محمية بـ try/catch
- الأخطاء تُسجّل بوضوح مع رسائل باللغة العربية
- واجهة المستخدم تعرض رسائل خطأ مفهومة

### الأداء:
- Throttling يمنع تجاوز حدود الخدمة
- حد 48,192 توكن يضمن استجابات كاملة
- المحطات تعمل بالتسلسل (لا parallel) لضمان الاعتماد الصحيح

### الأمان:
- مفتاح API يُقرأ من المتغيرات البيئية فقط
- لا يتم تسجيل محتوى حساس
- التحقق من المدخلات قبل المعالجة

---

**تاريخ الإنشاء**: 2025-01-XX  
**الفرع**: `feat/no-json-ui-stations-coupling`  
**الحالة**: ✅ مكتمل - جاهز للدمج
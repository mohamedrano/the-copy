# وثائق واجهات برمجة التطبيقات (API)

## مصادقة الطلبات

يجب على جميع الاستدعاءات التي تبدأ بالمسار `/api` تضمين ترويسة `X-API-Key` تحتوي على مفتاح صالح. يمكن تعريف مفاتيح متعددة من خلال المتغير البيئي `VALID_API_KEYS` مفصولة بفاصلة.

## وسيطات عامة

- يتم فرض نوع المحتوى `application/json` لكل طلب POST عبر الوسيط `requireJsonContent`.
- يتم تنظيف الحمولات النصية من الأحرف الخطرة والتعليمات البرمجية HTML عبر `sanitizeInput` قبل تمريرها إلى طبقة الأعمال.
- يتم التحكم في معدل استدعاءات التحليل عبر `aiAnalysisLimiter` (10 طلبات في الساعة لكل عميل).

## ‎POST `/api/analyze-text`

تحلل المحطات الثلاث الأولى النص وتعيد النتائج الأولية.

### ترويسات مطلوبة
- `Content-Type: application/json`
- `X-API-Key: <YOUR_KEY>`

### الجسم
```json
{
  "fullText": "... نص عربي خالٍ من وسوم HTML ...",
  "projectName": "عنوان المشروع",
  "proseFilePath": "اختياري: مسار الملف"
}
```

### الاستجابة الناجحة
```json
{
  "station1": {
    "majorCharacters": ["..."],
    "characterAnalysis": {"اسم": {"personalityTraits": "..."}},
    "relationshipAnalysis": {"keyRelationships": [...]},
    "narrativeStyleAnalysis": {"overallTone": "..."},
    "metadata": {"analysisTimestamp": "2024-01-01T00:00:00.000Z", "status": "Success"}
  },
  "station2": {
    "storyStatement": "...",
    "elevatorPitch": "...",
    "hybridGenre": "..."
  },
  "station3": {
    "networkSummary": {
      "charactersCount": 0,
      "relationshipsCount": 0,
      "conflictsCount": 0,
      "snapshotsCount": 0
    }
  }
}
```

### أخطاء محتملة
- `400` : بيانات غير صالحة (تتضمن تفاصيل Zod).
- `401`/`403` : فشل المصادقة.
- `429` : تجاوز حد المعدل.
- `500` : خطأ داخلي أثناء التحليل.

## ‎POST `/api/analyze-full-pipeline`

يشغّل المحطات السبع كاملة ويعيد النتائج المتسلسلة لكل محطة بالإضافة إلى بيانات وصفية للتشغيل.

### الاستجابة الناجحة
```json
{
  "success": true,
  "data": {
    "station1": { ... },
    "station2": { ... },
    "station3": { ... },
    "station4": { ... },
    "station5": { ... },
    "station6": { ... },
    "station7": { ... }
  },
  "metadata": {
    "stationsCompleted": 7,
    "totalExecutionTime": 12345,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "finishedAt": "2024-01-01T00:00:12.345Z"
  },
  "message": "تم إنجاز 7 محطات من أصل 7",
  "executionTime": "12.3 ثانية"
}
```

## ‎GET `/api/stations-status`

يعرض حالة كل محطة في آخر تشغيل (pending/running/completed/error).

### الاستجابة
```json
{
  "success": true,
  "stations": {
    "station1": "completed",
    "station2": "completed",
    "station3": "pending",
    "station4": "pending",
    "station5": "pending",
    "station6": "pending",
    "station7": "pending"
  },
  "totalStations": 7,
  "availableStations": 2
}
```

## نقاط الصحة

تم تسجيل المسارات `/health` و`/ready` و`/live` عبر `healthRouter` ويمكن استعمالها من أجل فحوصات الجاهزية والحيوية.

- `/health`: يعيد حالة "ok" مع التوقيت الحالي ومدة التشغيل.
- `/ready`: ينفّذ فحوصات البيئة (مثل وجود مفتاح Gemini وإمكانية الكتابة على القرص) ويعيد 200 أو 503.
- `/live`: يعيد حالة "alive" مع التوقيت الحالي.


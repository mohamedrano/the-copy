# المحلل الدرامي والمبدع المحاكي
# Drama Analyst & Creative Mimic

نظام ذكاء اصطناعي متقدم لتحليل النصوص الدرامية وتوليد محتوى إبداعي باستخدام 29 وكيل AI متخصص.

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn
- مفتاح Gemini API

### التثبيت

1. **استنساخ المشروع**
   ```bash
   git clone <repository-url>
   cd Drama-analyst-and-creative-mimic
   ```

2. **تثبيت التبعيات**
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة**
   ```bash
   cp .env.example .env
   ```

   افتح `.env` وأضف مفتاح Gemini API:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   VITE_GEMINI_MODEL=gemini-1.5-flash
   ```

### ملاحظات الأمان:
- لا ترفع ملف `.env` إلى نظام التحكم في الإصدارات
- استخدم `.env.example` كقالب للمتغيرات المطلوبة
- تأكد من تأمين مفاتيح API في بيئات الإنتاج
- التطبيق يتحقق من وجود مفتاح API عند البدء

4. **تشغيل المشروع**
   ```bash
   npm run dev
   ```

5. **افتح المتصفح**
   ```
   http://localhost:5173
   ```

## 📦 البناء للإنتاج

```bash
npm run build
npm run preview
```

## 🧪 الاختبار

```bash
npm test
```

## 📚 التوثيق

راجع [CLAUDE.md](CLAUDE.md) لتفاصيل البنية المعمارية والتطوير.

## 🔑 الحصول على Gemini API Key

1. زر [Google AI Studio](https://aistudio.google.com/app/apikey)
2. سجل الدخول بحساب Google
3. انقر "Create API Key"
4. انسخ المفتاح إلى ملف `.env`

## ⚠️ ملاحظات الأمان

- **لا تشارك** مفتاح API الخاص بك
- في الإنتاج، استخدم Backend Proxy لإخفاء المفتاح
- راجع [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md) للمزيد

## 📄 الترخيص

[أضف معلومات الترخيص هنا]
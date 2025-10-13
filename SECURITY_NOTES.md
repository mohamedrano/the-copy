# ملاحظات الأمان

## نظرة عامة

يطبق محرر السيناريو العربي عدة طبقات أمان لحماية المستخدمين من الهجمات الشائعة.

## تنظيف المحتوى (Content Sanitization)

### DOMPurify Integration
- **الموقع**: `src/utils/sanitizer.ts`
- **الغرض**: تنظيف HTML المدخل لمنع XSS
- **التكوين**: 
  - العلامات المسموحة: `p, div, span, br, strong, em, u`
  - الخصائص المسموحة: `class, style, dir`
  - العلامات المحظورة: `script, object, embed, link`

### وظائف التنظيف

#### `sanitizeHTML(dirty: string)`
- ينظف محتوى HTML العام
- يحافظ على النصوص العربية
- يزيل العناصر الخطيرة

#### `sanitizeContentEditable(content: string)`
- مخصص لعناصر contenteditable
- يحافظ على تنسيق النص الأساسي
- يمنع تنفيذ الكود الضار

#### `sanitizeUserInput(input: string)`
- ينظف المدخلات النصية
- يزيل الأحرف الضارة
- يحدد طول النص (100,000 حرف)

#### `sanitizeFilename(filename: string)`
- ينظف أسماء الملفات
- يمنع path traversal attacks
- يحدد الطول (255 حرف)

## سياسة أمان المحتوى (CSP)

### التكوين الحالي
```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' fonts.googleapis.com
font-src 'self' fonts.gstatic.com
img-src 'self' data: blob:
connect-src 'self' generativelanguage.googleapis.com
frame-src 'none'
object-src 'none'
```

### التبرير
- `'unsafe-inline'` مطلوب لـ React inline styles
- `fonts.googleapis.com` للخطوط العربية
- `generativelanguage.googleapis.com` لـ Gemini API

## سيناريوهات الهجوم المحمية

### 1. Cross-Site Scripting (XSS)
- **الحماية**: DOMPurify sanitization
- **المناطق المحمية**: contenteditable, user inputs
- **الاختبار**: تم اختبار حقن `<script>` tags

### 2. HTML Injection
- **الحماية**: Whitelist approach للعلامات
- **المناطق المحمية**: جميع مدخلات المستخدم
- **الاختبار**: تم اختبار حقن `<iframe>`, `<object>`

### 3. Path Traversal
- **الحماية**: `sanitizeFilename()` function
- **المناطق المحمية**: عمليات حفظ الملفات
- **الاختبار**: تم اختبار `../../../etc/passwd`

### 4. Denial of Service (DoS)
- **الحماية**: حدود طول النص
- **المناطق المحمية**: جميع المدخلات النصية
- **الحد الأقصى**: 100,000 حرف لكل مدخل

### 5. Content Security Policy Bypass
- **الحماية**: Strict CSP headers
- **المناطق المحمية**: تحميل الموارد الخارجية
- **الاختبار**: تم اختبار تحميل scripts خارجية

## الهجمات غير المحمية (المخاطر المقبولة)

### 1. Server-Side Request Forgery (SSRF)
- **السبب**: التطبيق client-side only
- **التخفيف**: لا يوجد server-side code

### 2. SQL Injection
- **السبب**: لا توجد قاعدة بيانات
- **التخفيف**: جميع البيانات محلية

### 3. Authentication Bypass
- **السبب**: لا يوجد نظام مصادقة
- **التخفيف**: التطبيق لا يتطلب مصادقة

## إرشادات النشر الآمن

### 1. HTTPS إلزامي
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### 2. Security Headers
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy strict-origin-when-cross-origin;
```

### 3. CSP Header
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com;";
```

## مراقبة الأمان

### 1. Error Monitoring
- **الأداة**: Sentry (مُوصى به)
- **التكوين**: تتبع محاولات XSS
- **التنبيهات**: عند اكتشاف محتوى ضار

### 2. Security Auditing
- **الأداة**: npm audit
- **التكرار**: مع كل CI/CD run
- **العتبة**: moderate vulnerabilities

### 3. Dependency Scanning
- **الأداة**: Snyk
- **التكوين**: في GitHub Actions
- **التقارير**: أسبوعية

## خطة الاستجابة للحوادث

### 1. اكتشاف XSS
1. تعطيل المحرر فوراً
2. تحديث DOMPurify
3. إضافة قواعد تنظيف جديدة
4. اختبار شامل قبل إعادة التشغيل

### 2. اكتشاف ثغرة في التبعيات
1. تقييم مستوى الخطر
2. تحديث التبعية المتأثرة
3. اختبار التوافق
4. نشر إصلاح عاجل

### 3. تسريب API Keys
1. إلغاء المفاتيح المتأثرة
2. إنشاء مفاتيح جديدة
3. تحديث التكوين
4. مراجعة سجلات الوصول

## اختبارات الأمان

### اختبارات آلية
- XSS payload injection
- HTML tag filtering
- File path validation
- Input length limits

### اختبارات يدوية
- Penetration testing
- Code review
- Dependency audit
- Configuration review

## جهات الاتصال

- **مسؤول الأمان**: security@project.com
- **تقارير الثغرات**: security-reports@project.com
- **الاستجابة للحوادث**: incident-response@project.com
# دليل استكشاف الأخطاء - The Copy

## مشاكل شائعة وحلولها

### 1. مشاكل التثبيت

#### خطأ: "Cannot find module"
```bash
# المشكلة
Error: Cannot find module 'react'

# الحل
npm install
# أو
rm -rf node_modules package-lock.json
npm install
```

#### خطأ: "Permission denied"
```bash
# المشكلة
Error: EACCES: permission denied

# الحل
sudo npm install -g npm
# أو
npm install --unsafe-perm
```

#### خطأ: "Out of memory"
```bash
# المشكلة
JavaScript heap out of memory

# الحل
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 2. مشاكل البناء

#### خطأ: "TypeScript compilation failed"
```bash
# المشكلة
Type error: Property 'x' does not exist on type 'y'

# الحل
# 1. فحص الأنواع
npm run type-check

# 2. إصلاح الأخطاء
# 3. إعادة البناء
npm run build
```

#### خطأ: "ESLint errors"
```bash
# المشكلة
ESLint found 5 errors

# الحل
# 1. فحص الأخطاء
npm run lint

# 2. إصلاح تلقائي
npm run lint:fix

# 3. إصلاح يدوي للأخطاء المتبقية
```

#### خطأ: "Build failed"
```bash
# المشكلة
Build failed with exit code 1

# الحل
# 1. تنظيف cache
npm cache clean --force

# 2. حذف node_modules
rm -rf node_modules package-lock.json

# 3. إعادة التثبيت
npm install

# 4. إعادة البناء
npm run build
```

### 3. مشاكل التشغيل

#### خطأ: "Port already in use"
```bash
# المشكلة
Error: listen EADDRINUSE: address already in use :::5177

# الحل
# 1. إيجاد العملية
lsof -ti:5177

# 2. إنهاء العملية
kill -9 $(lsof -ti:5177)

# 3. أو استخدام منفذ آخر
npm run dev -- --port 3000
```

#### خطأ: "Module not found"
```bash
# المشكلة
Module not found: Can't resolve '@/components/...'

# الحل
# 1. فحص مسارات الاستيراد
# 2. التأكد من tsconfig.json
# 3. إعادة تشغيل الخادم
npm run dev
```

#### خطأ: "Hot reload not working"
```bash
# المشكلة
Hot reload not updating changes

# الحل
# 1. إعادة تشغيل الخادم
npm run dev

# 2. فحص ملفات الاستيراد
# 3. تنظيف cache المتصفح
```

### 4. مشاكل النصوص العربية

#### خطأ: "Text direction not working"
```css
/* المشكلة */
النص يظهر من اليسار لليمين

/* الحل */
.arabic-text {
  direction: rtl;
  text-align: right;
}
```

#### خطأ: "Font not loading"
```css
/* المشكلة */
الخط العربي لا يظهر

/* الحل */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');

.arabic-text {
  font-family: 'Noto Sans Arabic', sans-serif;
}
```

#### خطأ: "Character encoding"
```html
<!-- المشكلة -->
النص يظهر كرموز غريبة

<!-- الحل -->
<meta charset="UTF-8">
```

### 5. مشاكل الذكاء الاصطناعي

#### خطأ: "API key not found"
```bash
# المشكلة
Error: API key not found

# الحل
# 1. فحص متغيرات البيئة
echo $VITE_GEMINI_API_KEY

# 2. إضافة المفتاح
export VITE_GEMINI_API_KEY="your_api_key_here"

# 3. إعادة تشغيل التطبيق
npm run dev
```

#### خطأ: "API rate limit exceeded"
```typescript
// المشكلة
Error: Rate limit exceeded

// الحل
// 1. إضافة تأخير
await new Promise(resolve => setTimeout(resolve, 1000));

// 2. إدارة الطلبات
const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
```

#### خطأ: "Network timeout"
```typescript
// المشكلة
Error: Network timeout

// الحل
// 1. زيادة timeout
const response = await fetch(url, {
  timeout: 30000 // 30 seconds
});

// 2. إعادة المحاولة
const retry = async (fn, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retry(fn, retries - 1);
    }
    throw error;
  }
};
```

### 6. مشاكل الأداء

#### خطأ: "Slow loading"
```typescript
// المشكلة
التطبيق بطيء في التحميل

// الحل
// 1. استخدام lazy loading
const LazyComponent = React.lazy(() => import('./Component'));

// 2. تحسين الصور
<img src={image} loading="lazy" />

// 3. استخدام useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

#### خطأ: "Memory leak"
```typescript
// المشكلة
Memory usage keeps increasing

// الحل
// 1. تنظيف event listeners
useEffect(() => {
  const handleResize = () => {};
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 2. تنظيف timers
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  
  return () => {
    clearInterval(timer);
  };
}, []);
```

### 7. مشاكل الاختبارات

#### خطأ: "Test timeout"
```typescript
// المشكلة
Test timeout after 5000ms

// الحل
// 1. زيادة timeout
test('slow test', async () => {
  // test code
}, 10000); // 10 seconds

// 2. استخدام async/await
test('async test', async () => {
  await expect(asyncFunction()).resolves.toBe(expected);
});
```

#### خطأ: "Mock not working"
```typescript
// المشكلة
Mock function not called

// الحل
// 1. إعادة تعيين mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// 2. فحص mock calls
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

### 8. مشاكل النشر

#### خطأ: "Build failed in production"
```bash
# المشكلة
Build failed with production optimizations

# الحل
# 1. فحص متغيرات البيئة
echo $NODE_ENV

# 2. بناء محلي
npm run build

# 3. فحص الأخطاء
npm run build 2>&1 | tee build.log
```

#### خطأ: "404 on refresh"
```nginx
# المشكلة
404 error when refreshing page

# الحل
# إضافة rewrite rule في nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## أدوات التشخيص

### 1. فحص النظام
```bash
# فحص إصدار Node.js
node --version

# فحص إصدار npm
npm --version

# فحص مساحة القرص
df -h

# فحص الذاكرة
free -h
```

### 2. فحص التطبيق
```bash
# فحص التبعيات
npm audit

# فحص الأمان
npm run security-audit

# فحص الأنواع
npm run type-check

# فحص الجودة
npm run lint
```

### 3. فحص الأداء
```bash
# تحليل الحزمة
npm run analyze

# فحص التغطية
npm run test:coverage

# فحص الأداء
npm run test:performance
```

## سجلات الأخطاء

### 1. سجلات التطبيق
```bash
# سجلات التطوير
npm run dev 2>&1 | tee dev.log

# سجلات البناء
npm run build 2>&1 | tee build.log

# سجلات الاختبارات
npm test 2>&1 | tee test.log
```

### 2. سجلات المتصفح
```javascript
// فتح Developer Tools
F12

// سجلات Console
console.log('Debug message');

// سجلات Network
// Network tab في Developer Tools

// سجلات Performance
// Performance tab في Developer Tools
```

### 3. سجلات الخادم
```bash
# سجلات Nginx
tail -f /var/log/nginx/error.log

# سجلات Docker
docker logs the-copy-app

# سجلات النظام
journalctl -u the-copy
```

## طلب المساعدة

### 1. جمع المعلومات
```bash
# معلومات النظام
uname -a
node --version
npm --version

# معلومات التطبيق
npm list --depth=0

# سجلات الأخطاء
cat dev.log | tail -50
```

### 2. إنشاء تقرير خطأ
```markdown
## وصف المشكلة
وصف مفصل للمشكلة

## خطوات إعادة الإنتاج
1. الخطوة الأولى
2. الخطوة الثانية
3. الخطوة الثالثة

## النتيجة المتوقعة
ما كان يجب أن يحدث

## النتيجة الفعلية
ما حدث فعلاً

## معلومات إضافية
- نظام التشغيل: Ubuntu 20.04
- إصدار Node.js: 20.0.0
- إصدار npm: 10.0.0
```

### 3. قنوات الدعم
- **GitHub Issues:** للمشاكل التقنية
- **GitHub Discussions:** للأسئلة العامة
- **البريد الإلكتروني:** support@the-copy.com
- **الدردشة:** [Discord Server](https://discord.gg/the-copy)

## نصائح للوقاية

### 1. صيانة منتظمة
- تحديث التبعيات شهرياً
- فحص الأمان أسبوعياً
- تنظيف cache دورياً

### 2. مراقبة مستمرة
- مراقبة استخدام الذاكرة
- مراقبة استجابة الخادم
- مراقبة سجلات الأخطاء

### 3. نسخ احتياطية
- نسخ احتياطية يومية للبيانات
- نسخ احتياطية أسبوعية للنظام
- اختبار استعادة النسخ الاحتياطية

---

**استكشاف سريع وفعال** 🔧
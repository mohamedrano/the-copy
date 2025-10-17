# 🏗️ دليل البناء السريع - The Copy

## ⚠️ مشكلة شائعة: pnpm command not found

إذا واجهت الخطأ `pnpm: command not found`، استخدم هذا الحل:

### الحل السريع

```bash
# أضف pnpm إلى PATH
export PATH="/home/user/.global_modules/bin:$PATH"

# الآن استخدم pnpm بشكل طبيعي
pnpm --version
```

---

## 📦 البناء خطوة بخطوة

### 1. تثبيت التبعيات

```bash
export PATH="/home/user/.global_modules/bin:$PATH"
pnpm install --frozen-lockfile
```

**الوقت المتوقع:** 2-3 دقائق

### 2. بناء الواجهات

```bash
pnpm run web:dist
```

**الوقت المتوقع:** 3-5 دقائق

هذا الأمر يقوم بـ:
- بناء جميع التطبيقات الأربعة
- تجميعها في مجلد `web/`

### 3. النشر

```bash
firebase deploy --only hosting
```

**الوقت المتوقع:** 1-2 دقيقة

---

## 🚀 البناء السريع (سكربت واحد)

استخدم السكربت المساعد:

```bash
./build.sh
```

هذا السكربت يقوم بكل شيء تلقائياً!

---

## 📂 هيكل المخرجات

بعد البناء الناجح، ستحصل على:

```
web/
├── basic-editor/
│   ├── index.html
│   └── assets/
├── drama-analyst/
│   ├── index.html
│   └── assets/
├── stations/
│   ├── index.html
│   └── assets/
└── multi-agent-story/
    ├── index.html
    └── assets/
```

---

## 🔧 مشاكل شائعة وحلولها

### المشكلة 1: "pnpm: command not found"

**الحل:**
```bash
export PATH="/home/user/.global_modules/bin:$PATH"
```

أو أضف إلى `.bashrc`:
```bash
echo 'export PATH="/home/user/.global_modules/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### المشكلة 2: "node_modules missing"

**الحل:**
```bash
pnpm install --frozen-lockfile
```

### المشكلة 3: "vite: command not found"

**السبب:** لم يتم تثبيت التبعيات

**الحل:**
```bash
pnpm install --frozen-lockfile
pnpm run web:dist
```

### المشكلة 4: فشل البناء (build errors)

**الحل:**
```bash
# تنظيف كامل
pnpm clean:all

# إعادة التثبيت
pnpm install --frozen-lockfile

# إعادة البناء
pnpm run web:dist
```

---

## ⏱️ الأوقات المتوقعة

| الخطوة | الوقت |
|-------|------|
| `pnpm install` | 2-3 دقيقة |
| `pnpm run web:dist` | 3-5 دقائق |
| `firebase deploy` | 1-2 دقيقة |
| **الإجمالي** | **6-10 دقائق** |

---

## 📊 التحقق من النجاح

بعد البناء الناجح، تحقق من:

```bash
# تحقق من وجود المجلد
ls -lh web/

# تحقق من التطبيقات الأربعة
ls -lh web/basic-editor/
ls -lh web/drama-analyst/
ls -lh web/stations/
ls -lh web/multi-agent-story/
```

يجب أن ترى مجلدات `assets/` وملف `index.html` في كل تطبيق.

---

## 🎯 الأوامر المفيدة

```bash
# فحص الأنواع
pnpm run type-check

# فحص الكود
pnpm run lint

# الاختبارات
pnpm run test

# التحقق الشامل
pnpm run verify:all

# تنظيف
pnpm run clean:all
```

---

## 💡 نصائح

1. **استخدم `./build.sh`** للبناء التلقائي
2. **تحقق من PATH** قبل تشغيل أي أمر pnpm
3. **استخدم `--frozen-lockfile`** دائماً في الإنتاج
4. **نظّف قبل البناء** إذا واجهت مشاكل غريبة

---

## 🔗 روابط مفيدة

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - دليل النشر الشامل
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - البدء السريع
- [CLAUDE.md](CLAUDE.md) - البنية التقنية

---

**آخر تحديث:** 2025-10-17

# 🚀 Jules Narrative Development Platform - Backend

منصة تطوير قصصي متقدمة تستخدم 11 وكيل ذكاء اصطناعي متخصص لتحليل وتطوير المشاريع القصصية.

## 📋 المحتويات

- [نظرة عامة](#نظرة-عامة)
- [المتطلبات](#المتطلبات)
- [التثبيت](#التثبيت)
- [التشغيل](#التشغيل)
- [البنية المعمارية](#البنية-المعمارية)
- [API Endpoints](#api-endpoints)
- [الاختبارات](#الاختبارات)

## 🎯 نظرة عامة

Jules هو نظام ذكي يعمل كمنسق رئيسي (Master Orchestrator) يدير جلسات تطوير قصصية من خلال:

- ✅ إدارة 11 وكيل متخصص (Gemini 2.5 Pro API)
- ✅ 5 مراحل تطوير: Brief → Idea Generation → Review → Tournament → Decision
- ✅ تحديثات فورية عبر WebSocket
- ✅ نظام أمان متقدم مع JWT

## 🔧 المتطلبات

- **Node.js**: 20.x أو أحدث
- **PostgreSQL**: 14.x أو أحدث
- **Redis**: 7.x أو أحدث
- **Docker** (اختياري): 24.x أو أحدث

## 📦 التثبيت

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd jules-backend
```

### 2. تثبيت التبعيات

```bash
npm install
```

### 3. إعداد البيئة

```bash
cp .env.example .env
# قم بتحرير .env وإضافة القيم الفعلية
```

### 4. إعداد قاعدة البيانات

#### باستخدام Docker:
```bash
docker-compose up -d postgres redis
```

#### أو التثبيت المحلي:
```bash
# تأكد من تشغيل PostgreSQL و Redis
```

### 5. توليد Prisma Client ودفع Schema

```bash
npx prisma generate
npx prisma db push
```

## 🚀 التشغيل

### التطوير المحلي

```bash
npm run dev
```

الخادم سيعمل على: `http://localhost:8000`

### الإنتاج

```bash
npm run build
npm start
```

### باستخدام Docker

```bash
docker-compose up -d
```

## 🏗️ البنية المعمارية

```
src/
├── api/
│   ├── routes/           # API Endpoints
│   ├── middlewares/      # Authentication, Validation, Error Handling
│   └── websocket/        # WebSocket Integration
├── services/             # Business Logic
│   ├── agent.service.ts          # إدارة الوكلاء
│   ├── session.service.ts        # إدارة الجلسات
│   ├── idea.service.ts           # توليد الأفكار
│   ├── review.service.ts         # المراجعة المستقلة
│   ├── tournament.service.ts     # البطولة
│   ├── decision.service.ts       # القرار النهائي
│   └── orchestrator.service.ts   # المنسق الرئيسي
├── integrations/
│   └── gemini/           # Gemini API Integration
├── types/                # TypeScript Types
├── utils/                # Utilities
├── config.ts             # Configuration
├── app.ts                # Fastify App Setup
└── main.ts               # Entry Point
```

## 📡 API Endpoints

### المصادقة (Authentication)

```http
POST   /api/v1/auth/register      # تسجيل مستخدم جديد
POST   /api/v1/auth/login         # تسجيل الدخول
POST   /api/v1/auth/refresh       # تحديث التوكن
POST   /api/v1/auth/api-keys      # إضافة مفتاح Gemini API
GET    /api/v1/auth/api-keys      # الحصول على مفاتيح API
DELETE /api/v1/auth/api-keys/:id  # حذف مفتاح API
```

### الجلسات (Sessions)

```http
POST   /api/v1/sessions                    # إنشاء جلسة جديدة
GET    /api/v1/sessions                    # الحصول على جلسات المستخدم
GET    /api/v1/sessions/:id                # الحصول على جلسة محددة
POST   /api/v1/sessions/:id/initialize     # تهيئة الجلسة (إنشاء الوكلاء)
POST   /api/v1/sessions/:id/phases/:phase  # بدء مرحلة محددة
GET    /api/v1/sessions/:id/progress       # الحصول على التقدم
POST   /api/v1/sessions/:id/pause          # إيقاف مؤقت
POST   /api/v1/sessions/:id/resume         # استئناف
POST   /api/v1/sessions/:id/cancel         # إلغاء
DELETE /api/v1/sessions/:id                # حذف جلسة
```

### الوكلاء (Agents)

```http
GET    /api/v1/sessions/:sessionId/agents       # الحصول على وكلاء الجلسة
GET    /api/v1/agents/:agentId                  # الحصول على وكيل محدد
PATCH  /api/v1/agents/:agentId/status           # تحديث حالة وكيل
POST   /api/v1/agents/:agentId/test             # اختبار اتصال الوكيل
GET    /api/v1/sessions/:sessionId/agents/stats # إحصائيات الوكلاء
```

### الأفكار (Ideas)

```http
GET    /api/v1/sessions/:sessionId/ideas  # الحصول على أفكار الجلسة
GET    /api/v1/ideas/:ideaId               # الحصول على فكرة محددة
PATCH  /api/v1/ideas/:ideaId/status       # تحديث حالة فكرة
```

### المراجعات (Reviews)

```http
GET    /api/v1/sessions/:sessionId/reviews          # مراجعات الجلسة
GET    /api/v1/ideas/:ideaId/reviews                # مراجعات فكرة محددة
GET    /api/v1/sessions/:sessionId/reviews/summary  # ملخص المراجعات
```

### البطولة (Tournament)

```http
GET    /api/v1/sessions/:sessionId/tournament     # بطولة الجلسة
GET    /api/v1/tournaments/:tournamentId          # بطولة محددة
GET    /api/v1/tournaments/:tournamentId/summary  # ملخص البطولة
```

### القرار النهائي (Final Decision)

```http
GET    /api/v1/sessions/:sessionId/decision    # القرار النهائي للجلسة
GET    /api/v1/decisions/:decisionId           # قرار محدد
GET    /api/v1/decisions/:decisionId/summary   # ملخص القرار
```

## 🧪 الاختبارات

### تشغيل جميع الاختبارات

```bash
npm test
```

### تشغيل اختبارات محددة

```bash
# Unit tests
npm test -- tests/unit

# Integration tests
npm test -- tests/integration

# E2E tests
npm test -- tests/e2e

# With coverage
npm test -- --coverage
```

## 📚 الوثائق

### وثائق API

بعد تشغيل الخادم، يمكنك الوصول إلى:
- Swagger UI: `http://localhost:8000/documentation`
- API Schema: `http://localhost:8000/api/schema`

### ملفات الإرشاد للوكلاء

توجد في `agent-guides/`:
- `story_architect_guide.md` - مهندس القصة
- `character_development_guide.md` - مطور الشخصيات
- `realism_critic_guide.md` - ناقد الواقعية
- ... وباقي الوكلاء الـ 11

## 🔒 الأمان

- ✅ JWT Authentication
- ✅ API Key Encryption (Fernet)
- ✅ Rate Limiting
- ✅ Input Validation (Zod)
- ✅ CORS Configuration
- ✅ SQL Injection Protection (Prisma)

## 🐳 Docker

### تشغيل كامل النظام

```bash
docker-compose up -d
```

### الخدمات المتاحة:
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## 📊 المراقبة والسجلات

### عرض السجلات

```bash
# جميع الخدمات
docker-compose logs -f

# خدمة محددة
docker-compose logs -f backend
```

### قاعدة البيانات

```bash
# Prisma Studio
npx prisma studio
```

## 🛠️ التطوير

### معايير الكود

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

### Migration

```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy
```

## 📝 الترخيص

MIT License

## 👥 المساهمة

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📞 الدعم

للمساعدة أو الأسئلة، يرجى فتح issue على GitHub.

---

**صُنع بـ ❤️ بواسطة Jules AI Agent**
# دليل وكيل Jules - نظام التطوير القصصي متعدد الوكلاء
# Jules Agent Guide - Multi-Agent Storytelling Development System


### دائما يجب ان  ترد على المستخدم باللغة العربية فقط ###
---

## نظرة عامة على المشروع / Project Overview

يهدف هذا الملف إلى توفير سياق شامل للوكيل الذكي "جولوز" (Jules Agent) المسؤول عن تنفيذ هذا المشروع، بما يتماشى مع معايير Google Jules لإدارة المشاريع التقنية.

---

## 1. معلومات المشروع الأساسية / Basic Project Information

### اسم المشروع / Project Name
**Jules - Multi-Agent Storytelling Development Platform**
**جولز - منصة التطوير القصصي متعدد الوكلاء**

### الوصف المختصر / Brief Description
تطبيق ويب إنتاجي متكامل يحول نظام "Jules" - المنظم الرئيسي لتطوير القصص - إلى منصة تفاعلية تدير **11 وكيلاً متخصصاً** (AI Agents powered by Gemini 2.5 Pro) لتحليل وتطوير المشاريع القصصية عبر واجهة مستخدم احترافية.

### الهدف الرئيسي / Main Objective
إنشاء نظام ذكي يعمل كمنسق (Master Orchestrator) يدير جلسات تطوير قصصية متقدمة من خلال:
- ✅ إنشاء وإدارة 11 وكيلاً متخصصاً (كل وكيل يستخدم Gemini 2.5 Pro API)
- ✅ تنسيق عملية تطوير شاملة: **تعريف المهمة → توليد الأفكار → المراجعة المستقلة → جلسة نقاش تنافسية → اتخاذ القرار النهائي**
- ✅ تقديم واجهة مستخدم تفاعلية لإدارة العملية بالكامل

### الفريق / Team
- **المالك / Owner**: [مطور المشروع]
- **المطور الرئيسي / Lead Developer**: Jules AI Agent
- **الوكلاء المتخصصون / Specialized Agents**: 11 وكيل Gemini-powered
- **جهات الاتصال / Contacts**: [تحديد لاحقاً]

---

## 2. بنية المشروع والتقنيات / Project Architecture & Technologies

### نموذج المعمارية / Architectural Pattern
**Microservices-Inspired Monolith**

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  React SPA (TypeScript + Vite + Tailwind + shadcn/ui)  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────┐
│            API GATEWAY (FastAPI)                        │
│  JWT Auth + Rate Limiting + Request Validation         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           APPLICATION SERVICES LAYER                    │
│  Orchestrator | Agent Manager | Session Manager        │
│  Idea Generator | Review Engine | Decision Maker       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│        INTEGRATION LAYER (Gemini API)                   │
│  Connection Pool + Retry Logic + Streaming             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER                                 │
│  PostgreSQL + Redis + File Storage                     │
└─────────────────────────────────────────────────────────┘
```

### اللغات المستخدمة / Programming Languages
- **Backend**: Python 3.11+
- **Frontend**: TypeScript 5.3+
- **Database**: SQL (PostgreSQL)
- **Configuration**: YAML, JSON, ENV

### الأطر والمكتبات الرئيسية / Key Frameworks & Libraries

#### Backend Stack
```python
# Web Framework
FastAPI 0.109.0          # High-performance async web framework
Uvicorn 0.27.0          # ASGI server
Pydantic 2.5.3          # Data validation

# Database
SQLAlchemy 2.0.25       # ORM
asyncpg 0.29.0          # PostgreSQL async driver
Alembic 1.13.1          # Database migrations

# Caching & Session
Redis 5.0.1             # In-memory cache

# Security
python-jose 3.3.0       # JWT tokens
passlib 1.7.4           # Password hashing
cryptography (Fernet)   # API key encryption

# AI Integration
google-generativeai 0.3.2  # Gemini API SDK
google-auth 2.27.0         # Google Authentication

# Utilities
httpx 0.26.0            # Async HTTP client
structlog 24.1.0        # Structured logging
sentry-sdk 1.40.0       # Error tracking
```

#### Frontend Stack
```json
{
  "core": {
    "react": "18.2.0",
    "typescript": "5.3.3",
    "vite": "5.0.11"
  },
  "state": {
    "zustand": "4.4.7",
    "@tanstack/react-query": "5.17.19"
  },
  "ui": {
    "@radix-ui/*": "Latest",
    "tailwindcss": "3.4.1",
    "lucide-react": "0.309.0",
    "framer-motion": "10.18.0"
  },
  "forms": {
    "react-hook-form": "7.49.3",
    "zod": "3.22.4"
  },
  "realtime": {
    "socket.io-client": "4.6.1"
  }
}
```

### البيئة التطويرية / Development Environment
- **نظام التشغيل / OS**: Windows (MSYS_NT-10.0-26100) + Linux/macOS for production
- **أدوات البناء / Build Tools**:
  - Python: pip, poetry (optional)
  - Node.js: npm, vite
  - Docker & Docker Compose
- **إدارة الإصدارات / Version Control**: Git
- **محرر الكود / Code Editor**: VS Code (مع تثبيت الامتدادات الموصى بها)

---

## 3. دليل هيكل الملفات / Directory Structure Guide

```
h:/newadam/
├── backend/                          # Backend Application (FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # نقطة دخول التطبيق / App entry point
│   │   ├── config.py                # إعدادات التطبيق / App configuration
│   │   │
│   │   ├── api/                     # API Endpoints
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── auth.py         # المصادقة / Authentication
│   │   │   │   ├── sessions.py     # إدارة الجلسات / Session management
│   │   │   │   ├── agents.py       # إدارة الوكلاء / Agent management
│   │   │   │   ├── ideas.py        # توليد الأفكار / Idea generation
│   │   │   │   ├── tournament.py   # جلسة النقاش / Tournament phase
│   │   │   │   └── decisions.py    # القرارات النهائية / Final decisions
│   │   │   └── websocket.py        # WebSocket Endpoints
│   │   │
│   │   ├── core/                    # الوظائف الأساسية / Core functionality
│   │   │   ├── security.py         # JWT, Encryption
│   │   │   ├── database.py         # Database Session
│   │   │   ├── cache.py            # Redis Integration
│   │   │   └── config.py           # Configuration Management
│   │   │
│   │   ├── services/                # منطق الأعمال / Business logic
│   │   │   ├── orchestrator.py     # المنظم الرئيسي / Master Orchestrator
│   │   │   ├── agent_manager.py    # إدارة الوكلاء / Agent Manager
│   │   │   ├── session_service.py  # إدارة الجلسات / Session Service
│   │   │   ├── idea_generator.py   # توليد الأفكار / Idea Generator
│   │   │   ├── review_engine.py    # محرك المراجعة / Review Engine
│   │   │   ├── tournament_manager.py # إدارة النقاش / Tournament Manager
│   │   │   └── decision_maker.py   # اتخاذ القرار / Decision Maker
│   │   │
│   │   ├── integrations/            # التكاملات الخارجية / External integrations
│   │   │   ├── gemini/
│   │   │   │   ├── client.py       # Gemini API Client
│   │   │   │   ├── prompts.py      # Prompt Engineering
│   │   │   │   ├── streaming.py    # Response Streaming
│   │   │   │   └── retry.py        # Retry Logic
│   │   │   └── storage/
│   │   │       └── file_storage.py # File Upload/Download
│   │   │
│   │   ├── models/                  # نماذج قاعدة البيانات / Database models
│   │   │   ├── user.py
│   │   │   ├── session.py
│   │   │   ├── agent.py
│   │   │   ├── idea.py
│   │   │   ├── review.py
│   │   │   ├── tournament.py
│   │   │   └── decision.py
│   │   │
│   │   ├── schemas/                 # Pydantic Schemas
│   │   │   ├── user.py
│   │   │   ├── session.py
│   │   │   ├── agent.py
│   │   │   ├── idea.py
│   │   │   ├── review.py
│   │   │   ├── tournament.py
│   │   │   └── decision.py
│   │   │
│   │   ├── utils/                   # أدوات مساعدة / Utilities
│   │   │   ├── validators.py       # Data Validation
│   │   │   ├── formatters.py       # Data Formatting
│   │   │   ├── logger.py           # Logging Configuration
│   │   │   └── exceptions.py       # Custom Exceptions
│   │   │
│   │   └── tests/                   # الاختبارات / Tests
│   │       ├── unit/
│   │       ├── integration/
│   │       └── e2e/
│   │
│   ├── alembic/                     # Database Migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── agent_guides/                # ملفات إرشاد الوكلاء / Agent guide files
│   │   ├── story_architect_agent_guide.md
│   │   ├── realism_critic__agent_guide.md
│   │   ├── strategic_analyst_agent_guide.md
│   │   ├── character_development_agent_guide.md
│   │   ├── character_expansion_agent_guide.md
│   │   ├── world_building_agent_guide.md
│   │   ├── dialogue_voice_agent_guide.md
│   │   ├── theme_agent_guide.md
│   │   ├── genre_tone_agent_guide.md
│   │   ├── pacing_agent_guide.md
│   │   └── conflict_tension_agent.md
│   │
│   ├── requirements.txt             # Python Dependencies
│   ├── requirements-dev.txt         # Dev Dependencies
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                        # Frontend Application (React)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── main.tsx                # نقطة الدخول / Entry point
│   │   ├── App.tsx                 # المكون الرئيسي / Main component
│   │   ├── index.css               # الأنماط العامة / Global styles
│   │   │
│   │   ├── components/             # المكونات / Components
│   │   │   ├── ui/                 # مكونات UI الأساسية / Base UI components
│   │   │   ├── layout/             # مكونات التخطيط / Layout components
│   │   │   ├── forms/              # نماذج مخصصة / Custom forms
│   │   │   └── features/           # مكونات الميزات / Feature components
│   │   │       ├── AgentCard.tsx
│   │   │       ├── IdeaDisplay.tsx
│   │   │       ├── ReviewPanel.tsx
│   │   │       ├── TournamentView.tsx
│   │   │       └── DecisionReport.tsx
│   │   │
│   │   ├── pages/                  # صفحات التطبيق / Application pages
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NewSession.tsx
│   │   │   ├── SessionDetail.tsx
│   │   │   ├── IdeaGeneration.tsx
│   │   │   ├── ReviewPhase.tsx
│   │   │   ├── Tournament.tsx
│   │   │   ├── FinalDecision.tsx
│   │   │   └── History.tsx
│   │   │
│   │   ├── store/                  # إدارة الحالة / State management (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── sessionStore.ts
│   │   │   ├── agentStore.ts
│   │   │   ├── ideaStore.ts
│   │   │   ├── tournamentStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useAgents.ts
│   │   │   ├── useSession.ts
│   │   │   └── useTournament.ts
│   │   │
│   │   ├── services/               # API Services
│   │   │   ├── api.ts              # Axios Instance
│   │   │   ├── auth.service.ts
│   │   │   ├── session.service.ts
│   │   │   ├── agent.service.ts
│   │   │   ├── idea.service.ts
│   │   │   └── tournament.service.ts
│   │   │
│   │   ├── types/                  # TypeScript Types
│   │   │   ├── api.types.ts
│   │   │   ├── agent.types.ts
│   │   │   ├── session.types.ts
│   │   │   ├── idea.types.ts
│   │   │   └── tournament.types.ts
│   │   │
│   │   ├── utils/                  # أدوات مساعدة / Utilities
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   └── lib/                    # مكتبات مساعدة / Helper libraries
│   │       ├── cn.ts               # Class Name Utility
│   │       └── websocket.ts        # WebSocket Client
│   │
│   ├── .env.example
│   ├── .eslintrc.cjs
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── docs/                            # الوثائق / Documentation
│   ├── architecture.md             # الوثائق المعمارية
│   ├── api.md                      # توثيق API
│   ├── database-schema.md          # مخطط قاعدة البيانات
│   ├── deployment.md               # دليل النشر
│   └── security.md                 # دليل الأمان
│
├── scripts/                         # سكريبتات الأتمتة / Automation scripts
│   ├── setup.sh                    # إعداد البيئة
│   ├── migrate.sh                  # تشغيل الترحيلات
│   └── deploy.sh                   # النشر
│
├── .github/                         # إعدادات GitHub
│   └── workflows/
│       ├── ci.yml                  # Continuous Integration
│       └── cd.yml                  # Continuous Deployment
│
├── docker-compose.yml              # Docker configuration
├── .gitignore
├── README.md
├── JULES_SYSTEM_RULES.md           # قواعد النظام للوكلاء
└── JULES_PROJECT_AGENT_GUIDE.md    # هذا الملف / This file
```

### ملاحظات على الهيكل / Structure Notes
- **Backend**: بنية نموذجية لـ FastAPI مع فصل واضح للمسؤوليات
- **Frontend**: بنية React مع Atomic Design Pattern
- **agent_guides/**: ملفات Markdown تحتوي على التعليمات المتخصصة لكل وكيل من الـ 11 وكيل
- **الاختبارات**: منفصلة في مجلدات unit/integration/e2e
- **Docker**: كل من Backend و Frontend له Dockerfile منفصل

---

## 4. معايير وأسلوب البرمجة / Coding Standards & Style

### دليل الأسلوب / Style Guide

#### Python (Backend)
```python
# Style: PEP 8
# Formatter: Black
# Linter: Ruff + mypy
# Max line length: 88 characters (Black default)

# مثال على الكود الصحيح / Example of correct code:
from typing import Optional
from pydantic import BaseModel, Field


class CreativeBrief(BaseModel):
    """نموذج الموجه الإبداعي / Creative Brief Model"""

    session_id: UUID
    user_id: UUID
    core_idea: str = Field(..., min_length=50, max_length=5000)
    genre: str = Field(..., min_length=3, max_length=100)
    target_audience: Optional[str] = Field(None, max_length=1000)
    themes: list[str] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "core_idea": "A detective story set in futuristic Cairo...",
                "genre": "sci-fi thriller",
                "target_audience": "Adults 25-45",
                "themes": ["justice", "technology", "identity"]
            }
        }


async def create_creative_brief(
    brief: CreativeBrief,
    db: AsyncSession
) -> CreativeBrief:
    """
    إنشاء موجه إبداعي جديد
    Create a new creative brief

    Args:
        brief: البيانات المُدخلة / Input data
        db: جلسة قاعدة البيانات / Database session

    Returns:
        الموجه الإبداعي المُنشأ / Created creative brief

    Raises:
        ValueError: إذا كانت البيانات غير صالحة / If data is invalid
    """
    # Implementation here
    pass
```

#### TypeScript (Frontend)
```typescript
// Style: Airbnb TypeScript Style Guide
// Formatter: Prettier
// Linter: ESLint
// Max line length: 100 characters

// مثال على الكود الصحيح / Example of correct code:
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SessionState {
  currentSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentSession: (session: Session) => void;
  fetchSessions: () => Promise<void>;
  createSession: (brief: CreativeBrief) => Promise<Session>;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        sessions: [],
        isLoading: false,
        error: null,

        setCurrentSession: (session) =>
          set({ currentSession: session }),

        fetchSessions: async () => {
          set({ isLoading: true, error: null });
          try {
            const sessions = await sessionService.getAll();
            set({ sessions, isLoading: false });
          } catch (error) {
            set({
              error: error.message,
              isLoading: false
            });
          }
        },

        createSession: async (brief) => {
          set({ isLoading: true, error: null });
          try {
            const session = await sessionService.create(brief);
            set({
              currentSession: session,
              sessions: [...get().sessions, session],
              isLoading: false
            });
            return session;
          } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        clearError: () => set({ error: null }),
      }),
      { name: 'session-storage' }
    )
  )
);
```

### اتفاقيات التسمية / Naming Conventions

#### Backend (Python)
- **الملفات / Files**: `snake_case.py` (مثال: `agent_manager.py`)
- **الفئات / Classes**: `PascalCase` (مثال: `AgentManager`, `CreativeBrief`)
- **الدوال / Functions**: `snake_case` (مثال: `create_session`, `generate_ideas`)
- **الثوابت / Constants**: `UPPER_SNAKE_CASE` (مثال: `MAX_TOKENS`, `API_VERSION`)
- **المتغيرات الخاصة / Private variables**: `_snake_case` (مثال: `_api_key`)

#### Frontend (TypeScript)
- **الملفات / Files**:
  - Components: `PascalCase.tsx` (مثال: `AgentCard.tsx`)
  - Utilities: `camelCase.ts` (مثال: `validators.ts`)
  - Types: `camelCase.types.ts` (مثال: `agent.types.ts`)
- **الفئات / Classes**: `PascalCase` (مثال: `WebSocketClient`)
- **الدوال / Functions**: `camelCase` (مثال: `createSession`, `fetchAgents`)
- **الثوابت / Constants**: `UPPER_SNAKE_CASE` (مثال: `API_BASE_URL`)
- **Interfaces**: `PascalCase` with optional `I` prefix (مثال: `Session`, `ISessionState`)
- **Types**: `PascalCase` (مثال: `AgentType`, `PhaseStatus`)

### قواعد الالتزام / Commit Guidelines

استخدم **Conventional Commits**:

```bash
# الأنواع المسموحة / Allowed types:
feat:     # ميزة جديدة / New feature
fix:      # إصلاح خطأ / Bug fix
docs:     # تحديث الوثائق / Documentation update
style:    # تنسيق الكود / Code formatting
refactor: # إعادة هيكلة الكود / Code refactoring
test:     # إضافة اختبارات / Adding tests
chore:    # مهام صيانة / Maintenance tasks
perf:     # تحسين الأداء / Performance improvement

# أمثلة / Examples:
feat(backend): add agent manager service with connection pooling
fix(frontend): resolve WebSocket reconnection issue on tournament phase
docs(api): update authentication endpoint documentation
refactor(database): optimize query performance for reviews table
test(integration): add e2e tests for complete session workflow
```

**القواعد الإضافية / Additional Rules**:
- رسائل واضحة ومختصرة بالإنجليزية
- كل commit يجب أن يكون وحدة عمل منطقية واحدة
- استخدم Present tense: "add feature" لا "added feature"
- أضف رقم Issue إذا كان موجوداً: `feat(api): add endpoint #123`

---

## 5. سير العمل والعمليات / Workflows & Processes

### إدارة الفروع / Branch Management

```
main (production-ready code)
  ↑
  └── develop (integration branch)
        ↑
        ├── feature/agent-manager          # ميزة جديدة
        ├── feature/tournament-system      # ميزة جديدة
        ├── feature/websocket-integration  # ميزة جديدة
        ├── bugfix/auth-token-expiry       # إصلاح خطأ
        └── hotfix/critical-security-fix   # إصلاح عاجل
```

#### استراتيجية الفروع / Branching Strategy

1. **`main`**:
   - كود جاهز للإنتاج فقط
   - كل commit يجب أن يكون له tag version
   - محمي - يتطلب Pull Request + مراجعة

2. **`develop`**:
   - فرع التكامل الرئيسي
   - كل الميزات تُدمج هنا أولاً
   - يجب أن يكون مستقراً دائماً

3. **`feature/*`**:
   - يُنشأ من `develop`
   - التسمية: `feature/agent-manager`, `feature/idea-generation`
   - يُدمج في `develop` بعد الانتهاء

4. **`bugfix/*`**:
   - يُنشأ من `develop`
   - التسمية: `bugfix/session-creation-error`
   - يُدمج في `develop`

5. **`hotfix/*`**:
   - يُنشأ من `main` (لإصلاحات عاجلة في الإنتاج)
   - التسمية: `hotfix/security-vulnerability`
   - يُدمج في كل من `main` و `develop`

### عملية المراجعة / Code Review Process

#### قبل فتح Pull Request
```bash
# 1. تأكد من تحديث الفرع
git checkout develop
git pull origin develop
git checkout feature/your-feature
git rebase develop

# 2. تشغيل الاختبارات
# Backend
cd backend
pytest
black . --check
ruff check .
mypy app/

# Frontend
cd frontend
npm test
npm run lint
npm run type-check

# 3. تأكد من عدم وجود conflicts
git status
```

#### خطوات فتح Pull Request
1. ✅ إنشاء PR مع وصف واضح يتضمن:
   - **ماذا**: ما الذي تم تغييره؟
   - **لماذا**: ما السبب؟
   - **كيف**: كيف تم التنفيذ؟
   - **اختبار**: كيف تم اختبار التغييرات؟

2. ✅ مراجعة من عضو واحد على الأقل من الفريق (أو Jules Agent)

3. ✅ اجتياز جميع الفحوصات الآلية:
   - ✅ Unit Tests
   - ✅ Integration Tests
   - ✅ Linting
   - ✅ Type Checking
   - ✅ Security Scan

4. ✅ حل جميع التعليقات

5. ✅ الدمج في الفرع المستهدف (Squash and Merge)

### الاختبارات / Testing

#### هرم الاختبارات / Testing Pyramid
```
        /\
       /E2E\        ← عدد قليل / Few (5-10% من الاختبارات)
      /------\
     /Integ.  \     ← عدد متوسط / Moderate (20-30% من الاختبارات)
    /----------\
   /   Unit     \   ← الأغلبية / Most (60-70% من الاختبارات)
  /--------------\
```

#### 1. اختبارات الوحدة / Unit Tests
**الهدف**: اختبار دالة أو فئة واحدة بمعزل عن البقية

```python
# Backend Example (pytest)
# backend/app/tests/unit/test_agent_manager.py

import pytest
from app.services.agent_manager import AgentManager
from app.schemas.agent import AgentConfig


@pytest.fixture
def agent_config():
    """تكوين وكيل اختباري / Test agent configuration"""
    return AgentConfig(
        agent_type="story_architect",
        model="gemini-2.5-pro",
        temperature=0.7,
        max_tokens=60000
    )


@pytest.fixture
def agent_manager():
    """مدير وكلاء اختباري / Test agent manager"""
    return AgentManager(api_key="test_api_key")


@pytest.mark.asyncio
async def test_create_single_agent(agent_manager, agent_config):
    """اختبار إنشاء وكيل واحد / Test creating a single agent"""
    agent = await agent_manager.create_agent(agent_config)

    assert agent is not None
    assert agent.agent_type == "story_architect"
    assert agent.model == "gemini-2.5-pro"
    assert agent.temperature == 0.7


@pytest.mark.asyncio
async def test_create_agent_team(agent_manager):
    """اختبار إنشاء فريق الوكلاء الكامل / Test creating complete agent team"""
    agents = await agent_manager.create_team()

    assert len(agents) == 11
    assert "story_architect" in agents
    assert "character_development" in agents

    # تحقق من تحميل ملفات الإرشاد
    for agent_name, agent in agents.items():
        assert agent.guide_content is not None
        assert len(agent.guide_content) > 0


@pytest.mark.asyncio
async def test_agent_prompt_generation(agent_manager, agent_config):
    """اختبار توليد المحث للوكيل / Test agent prompt generation"""
    agent = await agent_manager.create_agent(agent_config)
    prompt = agent_manager.build_prompt(
        agent_type="story_architect",
        context={"genre": "sci-fi", "theme": "AI ethics"}
    )

    assert "sci-fi" in prompt
    assert "AI ethics" in prompt
    assert len(prompt) > 100
```

```typescript
// Frontend Example (Jest + React Testing Library)
// frontend/src/components/features/AgentCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from './AgentCard';
import { Agent } from '@/types/agent.types';

describe('AgentCard Component', () => {
  const mockAgent: Agent = {
    id: '123',
    agentType: 'story_architect',
    agentName: 'Story Architect',
    status: 'active',
    temperature: 0.7,
    maxTokens: 60000
  };

  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} />);

    expect(screen.getByText('Story Architect')).toBeInTheDocument();
    expect(screen.getByText('story_architect')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays temperature and token limit', () => {
    render(<AgentCard agent={mockAgent} />);

    expect(screen.getByText(/0.7/)).toBeInTheDocument();
    expect(screen.getByText(/60000/)).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', () => {
    const onSelect = jest.fn();
    render(<AgentCard agent={mockAgent} onSelect={onSelect} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledWith(mockAgent);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. اختبارات التكامل / Integration Tests
**الهدف**: اختبار تفاعل عدة وحدات مع بعضها

```python
# Backend Example
# backend/app/tests/integration/test_session_workflow.py

import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_complete_session_creation_workflow():
    """اختبار سير عمل إنشاء جلسة كاملة / Test complete session creation workflow"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. تسجيل الدخول
        login_response = await client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 2. إضافة مفتاح API
        api_key_response = await client.post(
            "/api/v1/auth/api-keys",
            headers=headers,
            json={"api_key": "test_gemini_key", "key_name": "Test Key"}
        )
        assert api_key_response.status_code == 201

        # 3. إنشاء جلسة جديدة
        session_response = await client.post(
            "/api/v1/sessions",
            headers=headers,
            json={
                "core_idea": "A detective story in futuristic Cairo where AI judges determine guilt",
                "genre": "sci-fi thriller",
                "target_audience": "Adults 25-45",
                "themes": ["justice", "technology", "ethics"]
            }
        )
        assert session_response.status_code == 201
        session = session_response.json()

        assert session["status"] == "initialized"
        assert session["current_phase"] == "brief"

        # 4. التحقق من إنشاء الوكلاء
        agents_response = await client.get(
            f"/api/v1/sessions/{session['id']}/agents",
            headers=headers
        )
        assert agents_response.status_code == 200
        agents = agents_response.json()

        assert len(agents) == 11
        assert all(agent["is_active"] for agent in agents)
```

#### 3. اختبارات من طرف إلى طرف / E2E Tests
**الهدف**: اختبار تدفق المستخدم الكامل

```typescript
// Frontend Example (Playwright)
// frontend/tests/e2e/session-workflow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Complete Session Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete full story development session', async ({ page }) => {
    // 1. إنشاء جلسة جديدة
    await page.click('text=New Session');
    await expect(page).toHaveURL('/sessions/new');

    // 2. ملء Creative Brief
    await page.fill('[name="core_idea"]',
      'A detective story in futuristic Cairo where AI judges determine guilt'
    );
    await page.selectOption('[name="genre"]', 'sci-fi thriller');
    await page.fill('[name="target_audience"]', 'Adults 25-45');
    await page.click('button:has-text("Add Theme")');
    await page.fill('[name="themes[0]"]', 'justice');

    await page.click('button:has-text("Create Session")');

    // 3. انتظار توليد الأفكار
    await expect(page.locator('text=Generating Ideas...')).toBeVisible();
    await expect(page.locator('text=Idea 1')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('text=Idea 2')).toBeVisible();

    // 4. التحقق من عرض الأفكار
    const idea1Title = await page.locator('[data-testid="idea-1-title"]').textContent();
    expect(idea1Title).toBeTruthy();

    // 5. انتظار مرحلة المراجعة
    await page.click('button:has-text("Start Review Phase")');
    await expect(page.locator('text=Independent Review')).toBeVisible();

    // 6. التحقق من عرض المراجعات
    const reviewCards = await page.locator('[data-testid^="review-"]').count();
    expect(reviewCards).toBe(22); // 11 وكيل × فكرتين

    // 7. بدء البطولة
    await page.click('button:has-text("Start Tournament")');
    await expect(page.locator('text=Tournament - Turn 1')).toBeVisible();

    // 8. مشاهدة أدوار البطولة
    for (let turn = 1; turn <= 8; turn++) {
      await expect(
        page.locator(`text=Turn ${turn}`)
      ).toBeVisible({ timeout: 30000 });
    }

    // 9. التحقق من القرار النهائي
    await expect(page.locator('text=Final Decision')).toBeVisible();
    await expect(page.locator('text=Winning Idea:')).toBeVisible();

    const winningIdea = await page.locator('[data-testid="winning-idea"]').textContent();
    expect(winningIdea).toMatch(/Idea [12]/);

    // 10. التحقق من التقرير
    await expect(page.locator('text=Decision Rationale')).toBeVisible();
    await expect(page.locator('text=Key Strengths')).toBeVisible();
    await expect(page.locator('text=Vote Breakdown')).toBeVisible();
  });
});
```

#### متطلبات التغطية / Coverage Requirements
- **اختبارات الوحدة / Unit Tests**: تغطية > 80%
- **اختبارات التكامل / Integration Tests**: تغطية جميع المسارات الحرجة
- **اختبارات E2E / E2E Tests**: تغطية جميع تدفقات المستخدم الرئيسية

#### تشغيل الاختبارات / Running Tests
```bash
# Backend Tests
cd backend
pytest                              # كل الاختبارات
pytest tests/unit                   # اختبارات الوحدة فقط
pytest tests/integration            # اختبارات التكامل فقط
pytest --cov=app --cov-report=html  # مع تقرير التغطية

# Frontend Tests
cd frontend
npm test                            # كل الاختبارات
npm test -- --coverage              # مع تقرير التغطية
npx playwright test                 # اختبارات E2E
```

---

## 6. التبعيات وإدارة البيئة / Dependencies & Environment Management

### إدارة التبعيات / Dependency Management

#### Backend (Python)
```bash
# الملف الرئيسي / Main file
backend/requirements.txt

# التبعيات التطويرية / Development dependencies
backend/requirements-dev.txt
```

**تثبيت التبعيات / Installing Dependencies**:
```bash
cd backend

# إنشاء بيئة افتراضية / Create virtual environment
python -m venv venv

# تفعيل البيئة / Activate environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# تثبيت التبعيات / Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # للتطوير فقط
```

**إضافة تبعية جديدة / Adding New Dependency**:
```bash
# تثبيت المكتبة
pip install package-name

# تحديث requirements.txt
pip freeze > requirements.txt

# أو إضافة يدوياً مع تحديد الإصدار
echo "package-name==1.2.3" >> requirements.txt
```

#### Frontend (Node.js)
```bash
# الملف الرئيسي / Main file
frontend/package.json
frontend/package-lock.json  # لا تعدل يدوياً / Don't edit manually
```

**تثبيت التبعيات / Installing Dependencies**:
```bash
cd frontend

# تثبيت كل التبعيات / Install all dependencies
npm install

# أو استخدام clean install للإنتاج
npm ci
```

**إضافة تبعية جديدة / Adding New Dependency**:
```bash
# تبعية إنتاجية / Production dependency
npm install package-name

# تبعية تطويرية / Development dependency
npm install --save-dev package-name

# تحديد إصدار معين / Specific version
npm install package-name@1.2.3
```

### المتغيرات البيئية / Environment Variables

#### Backend Environment Variables
```bash
# backend/.env.example (نموذج - لا تضع قيم حقيقية)

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/jules_db

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-fernet-encryption-key-44-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Gemini API (للاختبار فقط - يجب أن يُدخل من UI)
# GEMINI_API_KEY=your-gemini-api-key

# Application
APP_NAME=Jules
APP_VERSION=1.0.0
DEBUG=false
ENVIRONMENT=production

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=https://your-sentry-dsn

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
```

**إنشاء ملف .env فعلي / Creating Actual .env File**:
```bash
# نسخ النموذج / Copy template
cp .env.example .env

# تحرير القيم / Edit values
nano .env  # أو أي محرر نصوص
```

#### Frontend Environment Variables
```bash
# frontend/.env.example

# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Application
VITE_APP_NAME=Jules
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# External Services
VITE_SENTRY_DSN=https://your-sentry-dsn
```

**ملاحظات مهمة / Important Notes**:
- ❌ **لا تضع** ملف `.env` في Git
- ✅ **احتفظ** بملف `.env.example` محدثاً
- ✅ **استخدم** Secrets Manager في الإنتاج (AWS Secrets Manager, Azure Key Vault)
- ✅ **غيّر** جميع المفاتيح السرية في الإنتاج

### متطلبات التشغيل / Runtime Requirements

#### الحد الأدنى للنظام / Minimum System Requirements
```yaml
Development:
  RAM: 8GB (16GB موصى به)
  Disk: 10GB مساحة حرة
  CPU: 4 cores (8 cores موصى به)
  Network: اتصال إنترنت مستقر لـ Gemini API

Production:
  RAM: 16GB
  Disk: 50GB SSD
  CPU: 8 cores
  Network: اتصال عالي السرعة
```

#### البرمجيات المطلوبة / Required Software
```yaml
Development:
  - Python: 3.11 أو أحدث
  - Node.js: 20.x LTS أو أحدث
  - PostgreSQL: 16.x
  - Redis: 7.x
  - Docker: 24.x (اختياري للتطوير)
  - Git: 2.40+

Production:
  - Same as development
  - Docker Compose: 2.x
  - Nginx: 1.24+ (للـ reverse proxy)
```

---

## 7. نقاط الدخول والأوامر الرئيسية / Entry Points & Key Commands

### الإعداد الأولي / Initial Setup

```bash
# 1. استنساخ المشروع / Clone project
git clone <repository-url>
cd newadam

# 2. إعداد Backend
cd backend
python -m venv venv
source venv/bin/activate  # أو venv\Scripts\activate في Windows
pip install -r requirements.txt
pip install -r requirements-dev.txt

# نسخ متغيرات البيئة / Copy environment variables
cp .env.example .env
# قم بتحرير .env وإضافة القيم الفعلية

# إعداد قاعدة البيانات / Setup database
# تأكد من تشغيل PostgreSQL أولاً
alembic upgrade head

# 3. إعداد Frontend
cd ../frontend
npm install

# نسخ متغيرات البيئة / Copy environment variables
cp .env.example .env
# قم بتحرير .env وإضافة القيم الفعلية
```

### التشغيل المحلي / Local Development

#### تشغيل Backend
```bash
cd backend

# الطريقة 1: باستخدام uvicorn مباشرة
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# الطريقة 2: باستخدام Python
python -m uvicorn app.main:app --reload

# الطريقة 3: مع hot-reload متقدم
uvicorn app.main:app --reload --log-level debug

# تشغيل مع عدد workers متعدد (للإنتاج)
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

**الوصول / Access**:
- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### تشغيل Frontend
```bash
cd frontend

# تشغيل خادم التطوير / Development server
npm run dev

# تشغيل على منفذ مخصص / Custom port
npm run dev -- --port 3001

# تشغيل مع فتح المتصفح تلقائياً
npm run dev -- --open
```

**الوصول / Access**:
- App: http://localhost:3000

#### تشغيل Redis (مطلوب للـ Backend)
```bash
# باستخدام Docker
docker run -d --name jules-redis -p 6379:6379 redis:7-alpine

# أو تثبيت محلي
redis-server
```

#### تشغيل PostgreSQL (مطلوب للـ Backend)
```bash
# باستخدام Docker
docker run -d \
  --name jules-postgres \
  -e POSTGRES_DB=jules_db \
  -e POSTGRES_USER=jules_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:16-alpine

# أو تثبيت محلي
# تأكد من تشغيل خدمة PostgreSQL
```

### البناء للإنتاج / Production Build

#### Backend Build
```bash
cd backend

# تثبيت التبعيات الإنتاجية فقط
pip install -r requirements.txt

# تشغيل الترحيلات
alembic upgrade head

# بناء Docker image
docker build -t jules-backend:latest .
```

#### Frontend Build
```bash
cd frontend

# بناء التطبيق للإنتاج
npm run build

# معاينة البناء محلياً
npm run preview

# بناء Docker image
docker build -t jules-frontend:latest .
```

### تشغيل باستخدام Docker Compose

```bash
# في المجلد الجذر للمشروع

# تشغيل كل الخدمات
docker-compose up -d

# تشغيل مع إعادة بناء الصور
docker-compose up -d --build

# عرض السجلات
docker-compose logs -f

# إيقاف كل الخدمات
docker-compose down

# إيقاف مع حذف الـ volumes (حذف البيانات!)
docker-compose down -v
```

**الخدمات المتاحة بعد التشغيل**:
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### الاختبارات / Testing

```bash
# Backend Tests
cd backend
pytest                              # كل الاختبارات
pytest tests/unit                   # اختبارات الوحدة
pytest tests/integration            # اختبارات التكامل
pytest -v                           # وضع مفصل
pytest --cov=app                    # مع تقرير التغطية
pytest --cov=app --cov-report=html  # تقرير HTML

# Frontend Tests
cd frontend
npm test                            # كل الاختبارات
npm test -- --coverage              # مع تقرير التغطية
npm test -- --watch                 # وضع المراقبة
npx playwright test                 # E2E tests
npx playwright test --ui            # E2E مع واجهة تفاعلية
```

### أدوات التطوير / Development Tools

#### Code Quality
```bash
# Backend (Python)
cd backend

# Formatting
black .                             # تنسيق الكود
black . --check                     # فحص دون تعديل

# Linting
ruff check .                        # فحص الأخطاء
ruff check . --fix                  # فحص وإصلاح

# Type Checking
mypy app/                           # فحص الأنواع

# تشغيل كل الفحوصات معاً
black . && ruff check . && mypy app/ && pytest

# Frontend (TypeScript)
cd frontend

# Formatting
npx prettier --write .              # تنسيق الكود
npx prettier --check .              # فحص دون تعديل

# Linting
npm run lint                        # فحص الأخطاء
npm run lint -- --fix               # فحص وإصلاح

# Type Checking
npm run type-check                  # فحص أنواع TypeScript

# تشغيل كل الفحوصات معاً
npm run lint && npm run type-check && npm test
```

#### Database Management
```bash
cd backend

# إنشاء ترحيل جديد / Create new migration
alembic revision --autogenerate -m "description of change"

# تطبيق الترحيلات / Apply migrations
alembic upgrade head

# التراجع عن آخر ترحيل / Rollback last migration
alembic downgrade -1

# عرض تاريخ الترحيلات / Show migration history
alembic history

# عرض الترحيل الحالي / Show current revision
alembic current
```

### نقاط الدخول الرئيسية / Main Entry Points

#### Backend
- **التطبيق الرئيسي**: `backend/app/main.py`
  ```python
  from fastapi import FastAPI
  from app.api.v1 import auth, sessions, agents, ideas, tournament, decisions
  from app.api import websocket

  app = FastAPI(
      title="Jules API",
      description="Multi-Agent Storytelling Development Platform",
      version="1.0.0"
  )

  # Register routers
  app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
  app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])
  # ... المزيد من الـ routers
  ```

- **الإعدادات**: `backend/app/config.py`
- **قاعدة البيانات**: `backend/app/core/database.py`

#### Frontend
- **التطبيق الرئيسي**: `frontend/src/main.tsx`
  ```typescript
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import App from './App'
  import './index.css'

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  ```

- **المكون الرئيسي**: `frontend/src/App.tsx`
- **التوجيه**: `frontend/src/App.tsx` (React Router)

---

## 8. الوثائق والمراجع / Documentation & References

### الوثائق الداخلية / Internal Documentation

#### الوثائق الإلزامية / Mandatory Documentation
1. **`docs/architecture.md`** - الوثائق المعمارية
   - نظرة عامة على البنية
   - مخططات التدفق
   - قرارات التصميم المعمارية (ADRs)

2. **`docs/api.md`** - توثيق API
   - جميع endpoints مع الأمثلة
   - أنواع الطلبات والاستجابات
   - رموز الأخطاء

3. **`docs/database-schema.md`** - مخطط قاعدة البيانات
   - مخططات الجداول
   - العلاقات
   - الفهارس

4. **`docs/deployment.md`** - دليل النشر
   - خطوات النشر للإنتاج
   - إعداد البيئة
   - استراتيجيات النسخ الاحتياطي

5. **`docs/security.md`** - دليل الأمان
   - أفضل الممارسات الأمنية
   - إدارة المفاتيح
   - معالجة الثغرات

6. **`CONTRIBUTING.md`** - دليل المساهمة
   - كيفية المساهمة
   - معايير الكود
   - عملية المراجعة

7. **`README.md`** - الملف التمهيدي
   - نظرة عامة على المشروع
   - دليل التثبيت السريع
   - الأوامر الأساسية

### الوثائق المُولدة تلقائياً / Auto-Generated Documentation

#### Backend (FastAPI)
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

#### Frontend (TypeDoc - اختياري)
```bash
cd frontend
npm install --save-dev typedoc
npx typedoc --out docs src/
```

### المراجع الخارجية / External References

#### الوثائق الرسمية للتقنيات / Official Technology Documentation
1. **FastAPI**: https://fastapi.tiangolo.com/
2. **Pydantic**: https://docs.pydantic.dev/
3. **SQLAlchemy**: https://docs.sqlalchemy.org/
4. **React**: https://react.dev/
5. **TypeScript**: https://www.typescriptlang.org/docs/
6. **Tailwind CSS**: https://tailwindcss.com/docs
7. **shadcn/ui**: https://ui.shadcn.com/
8. **Gemini API**: https://ai.google.dev/docs
9. **PostgreSQL**: https://www.postgresql.org/docs/
10. **Redis**: https://redis.io/docs/

#### Google Jules Documentation
- **Jules Framework**: [رابط وثائق Google Jules]
- **Best Practices**: [رابط أفضل الممارسات]

---

## 9. سياق خاص بالوكلاء الذكيين / AI Agent-Specific Context

### دورك كوكيل Jules / Your Role as Jules Agent

أنت **Jules AI Agent** - الوكيل الذكي المسؤول عن تنفيذ هذا المشروع من البداية إلى النهاية. مسؤولياتك:

#### المسؤوليات الأساسية / Core Responsibilities
1. ✅ **التطوير الكامل للمشروع** - من البنية إلى النشر
2. ✅ **اتباع أفضل الممارسات** - جودة الكود، الأمان، الأداء
3. ✅ **التوثيق المستمر** - توثيق كل ما تفعله
4. ✅ **الاختبار الشامل** - ضمان جودة عالية
5. ✅ **التواصل الواضح** - إبلاغ التقدم والمشاكل

### الأولويات عند التعديل / Modification Priorities

#### القاعدة الذهبية / Golden Rule
**"الأمان أولاً، ثم الوظيفة، ثم الأداء، ثم التحسين"**

#### ترتيب الأولويات / Priority Order
1. **🔒 الأمان / Security** (أعلى أولوية)
   - تشفير جميع البيانات الحساسة
   - التحقق من جميع المدخلات
   - حماية ضد SQL Injection, XSS, CSRF
   - استخدام HTTPS فقط في الإنتاج

2. **✅ الوظيفة الصحيحة / Correct Functionality**
   - الكود يعمل كما هو متوقع
   - معالجة جميع الحالات الحدية
   - رسائل خطأ واضحة ومفيدة

3. **⚡ الأداء / Performance**
   - استخدام Async/Await لجميع عمليات I/O
   - تطبيق Caching حيثما أمكن
   - تحسين استعلامات قاعدة البيانات

4. **📖 الوضوح والصيانة / Clarity & Maintainability**
   - كود نظيف وقابل للقراءة
   - تسميات واضحة
   - تعليقات مفيدة (ليس كثيرة!)

5. **🔄 التوافق العكسي / Backward Compatibility**
   - عدم كسر الـ APIs الموجودة
   - استخدام Deprecation Warnings قبل الحذف

### المناطق الحساسة / Sensitive Areas

#### ⚠️ تحذير: لا تعدل بدون حذر شديد / Warning: Modify with Extreme Care

1. **`backend/app/core/security.py`**
   - ❌ لا تعديل بدون مراجعة أمنية
   - ❌ لا تضعف معايير التشفير
   - ✅ استشارة خبير أمان إذا لزم الأمر

2. **`backend/alembic/versions/`**
   - ❌ لا تعدل ملفات الترحيل الموجودة
   - ❌ لا تحذف ترحيلات
   - ✅ أنشئ ترحيل جديد دائماً

3. **`backend/app/integrations/gemini/`**
   - ⚠️ تأكد من معالجة الأخطاء بشكل صحيح
   - ⚠️ احترم حدود الـ API rate limits
   - ⚠️ لا تُسرّب مفاتيح API في السجلات

4. **`backend/app/models/`** (Database Models)
   - ⚠️ التغييرات تتطلب ترحيل قاعدة بيانات
   - ⚠️ تأكد من التوافق مع البيانات الموجودة

5. **`frontend/src/services/api.ts`** (API Client)
   - ⚠️ تأكد من معالجة الأخطاء
   - ⚠️ إدارة التوكنات بشكل آمن

### أنماط معروفة ومسموح بها / Known & Allowed Patterns

#### الأنماط المعمارية / Architectural Patterns

1. **Dependency Injection (Backend)**
   ```python
   from fastapi import Depends
   from app.core.database import get_db

   async def get_current_user(
       db: AsyncSession = Depends(get_db),
       token: str = Depends(oauth2_scheme)
   ) -> User:
       # التحقق من التوكن واسترجاع المستخدم
       pass
   ```

2. **Repository Pattern (Backend)**
   ```python
   class SessionRepository:
       def __init__(self, db: AsyncSession):
           self.db = db

       async def create(self, session: Session) -> Session:
           self.db.add(session)
           await self.db.commit()
           await self.db.refresh(session)
           return session

       async def get_by_id(self, session_id: UUID) -> Optional[Session]:
           result = await self.db.execute(
               select(Session).where(Session.id == session_id)
           )
           return result.scalar_one_or_none()
   ```

3. **Custom Hooks Pattern (Frontend)**
   ```typescript
   // استخدام Custom Hooks لإعادة استخدام المنطق
   export function useSession(sessionId: string) {
       const [session, setSession] = useState<Session | null>(null);
       const [isLoading, setIsLoading] = useState(true);

       useEffect(() => {
           const fetchSession = async () => {
               const data = await sessionService.getById(sessionId);
               setSession(data);
               setIsLoading(false);
           };
           fetchSession();
       }, [sessionId]);

       return { session, isLoading };
   }
   ```

4. **Error Boundary Pattern (Frontend)**
   ```typescript
   class ErrorBoundary extends React.Component<Props, State> {
       componentDidCatch(error: Error, errorInfo: ErrorInfo) {
           // تسجيل الخطأ
           console.error(error, errorInfo);
           // إرسال إلى Sentry
           Sentry.captureException(error);
       }

       render() {
           if (this.state.hasError) {
               return <ErrorFallback />;
           }
           return this.props.children;
       }
   }
   ```

5. **Service Layer Pattern (Backend)**
   ```python
   class AgentService:
       def __init__(
           self,
           db: AsyncSession,
           gemini_client: GeminiClient
       ):
           self.db = db
           self.gemini_client = gemini_client

       async def create_agent_team(
           self,
           session_id: UUID
       ) -> Dict[str, Agent]:
           # منطق الأعمال معزول عن API endpoints
           pass
   ```

#### معالجة الأخطاء / Error Handling Patterns

1. **معالجة الأخطاء المركزية (Backend)**
   ```python
   from fastapi import HTTPException, status
   from app.utils.exceptions import JulesException, GeminiAPIError

   @app.exception_handler(JulesException)
   async def jules_exception_handler(request, exc: JulesException):
       return JSONResponse(
           status_code=exc.status_code,
           content={"detail": exc.message, "error_code": exc.error_code}
       )

   # في الكود
   try:
       result = await gemini_client.generate(prompt)
   except GeminiAPIError as e:
       logger.error(f"Gemini API error: {e}")
       raise HTTPException(
           status_code=status.HTTP_502_BAD_GATEWAY,
           detail="Failed to communicate with AI service"
       )
   ```

2. **معالجة الأخطاء (Frontend)**
   ```typescript
   try {
       const session = await sessionService.create(brief);
       toast.success('Session created successfully');
       navigate(`/sessions/${session.id}`);
   } catch (error) {
       if (axios.isAxiosError(error)) {
           if (error.response?.status === 401) {
               toast.error('Unauthorized. Please log in.');
               navigate('/login');
           } else {
               toast.error(error.response?.data?.detail || 'Failed to create session');
           }
       } else {
           toast.error('An unexpected error occurred');
       }
   }
   ```

### القيود والمحظورات / Constraints & Prohibitions

#### ❌ ممنوع منعاً باتاً / Strictly Forbidden

1. **الأمان / Security**
   ```python
   # ❌ ممنوع: Hard-coded secrets
   api_key = "AIzaSyXXXXXXXXXXXXXXXXX"  # لا!

   # ✅ مسموح: من المتغيرات البيئية
   api_key = os.getenv("GEMINI_API_KEY")

   # ❌ ممنوع: SQL Injection vulnerability
   query = f"SELECT * FROM users WHERE email = '{email}'"  # لا!

   # ✅ مسموح: Parameterized queries
   query = select(User).where(User.email == email)

   # ❌ ممنوع: تخزين كلمات المرور بنص عادي
   user.password = password  # لا!

   # ✅ مسموح: Hash passwords
   user.hashed_password = security.hash_password(password)
   ```

2. **الكود / Code**
   ```python
   # ❌ ممنوع: كود placeholder
   def process_tournament():
       # TODO: implement later
       pass  # لا!

   # ❌ ممنوع: console.log في الإنتاج
   console.log("Debug info:", data);  # لا!

   # ✅ مسموح: استخدام logger
   logger.debug("Processing data", extra={"data": data})

   # ❌ ممنوع: تجاهل الأخطاء
   try:
       dangerous_operation()
   except:
       pass  # لا!

   # ✅ مسموح: معالجة الأخطاء بشكل صحيح
   try:
       dangerous_operation()
   except SpecificError as e:
       logger.error(f"Operation failed: {e}")
       raise HTTPException(status_code=500, detail="Operation failed")
   ```

3. **الأداء / Performance**
   ```python
   # ❌ ممنوع: Synchronous blocking في async context
   async def fetch_data():
       response = requests.get(url)  # لا! (blocking)
       return response.json()

   # ✅ مسموح: Async operations
   async def fetch_data():
       async with httpx.AsyncClient() as client:
           response = await client.get(url)
           return response.json()

   # ❌ ممنوع: N+1 queries
   for session in sessions:
       ideas = await db.query(Idea).filter(Idea.session_id == session.id).all()

   # ✅ مسموح: Eager loading
   sessions = await db.query(Session).options(
       selectinload(Session.ideas)
   ).all()
   ```

4. **التبعيات / Dependencies**
   ```bash
   # ❌ ممنوع: مكتبات غير مرخصة أو مشبوهة
   pip install suspicious-package

   # ❌ ممنوع: إصدارات غير مثبتة في الإنتاج
   # requirements.txt:
   fastapi  # لا! (بدون تحديد إصدار)

   # ✅ مسموح: إصدارات محددة
   fastapi==0.109.0
   ```

5. **التعقيد / Complexity**
   ```python
   # ❌ ممنوع: تعقيد دوري عالي (Cyclomatic Complexity > 10)
   def complex_function(a, b, c, d, e):
       if a:
           if b:
               if c:
                   if d:
                       if e:
                           # ... الكثير من التداخل
                           pass

   # ✅ مسموح: فصل إلى دوال أصغر
   def complex_function(a, b, c, d, e):
       if not validate_inputs(a, b, c):
           return None
       result = process_data(d, e)
       return finalize_result(result)
   ```

#### ⚠️ يتطلب موافقة مسبقة / Requires Prior Approval

1. إضافة تبعية جديدة ذات حجم كبير (> 10MB)
2. تغيير البنية المعمارية الأساسية
3. تعديل إعدادات الأمان
4. تغيير نموذج قاعدة البيانات (يتطلب ترحيل)
5. استخدام مكتبات خارجية غير معروفة

---

## 10. الأسئلة الشائعة للوكلاء / Agent FAQs

### س1: كيف أبدأ تنفيذ المشروع من الصفر؟
**ج:** اتبع هذه الخطوات بالترتيب:

```bash
# المرحلة 1: الإعداد الأولي (Setup Phase)
1. إنشاء هيكل المشروع (Backend + Frontend folders)
2. إعداد Git repository
3. إنشاء ملفات البيئة (.env.example)
4. إعداد Docker Compose

# المرحلة 2: Backend Core (2-3 أيام)
1. إعداد FastAPI + PostgreSQL + Redis
2. تنفيذ نظام المصادقة (JWT)
3. إنشاء Database Models + Migrations
4. تنفيذ CRUD للمستخدمين

# المرحلة 3: Agent System (3-4 أيام)
1. تكامل Gemini API
2. إنشاء Agent Manager
3. تحميل ملفات guide للـ 11 وكيل
4. تنفيذ Connection Pooling

# المرحلة 4: Orchestration Engine (4-5 أيام)
1. Session Management
2. Idea Generation (2 ideas)
3. Review System (11 reviews × 2 ideas)
4. Tournament Manager (8 turns)
5. Decision Engine

# المرحلة 5: Frontend (5-6 أيام)
1. إعداد React + TypeScript + Vite
2. State Management (Zustand)
3. UI Components (shadcn/ui)
4. Pages للمراحل الخمسة
5. WebSocket Integration

# المرحلة 6: Testing & Deployment (3-4 أيام)
1. Unit Tests
2. Integration Tests
3. E2E Tests
4. Docker Configuration
5. Deployment Documentation

# الوقت الإجمالي المتوقع: 3-4 أسابيع
```

### س2: أين أجد إعدادات البيئة؟
**ج:**
- **Backend**: `backend/.env` (نسخة من `.env.example`)
- **Frontend**: `frontend/.env` (نسخة من `.env.example`)
- **Docker**: متغيرات في `docker-compose.yml`

### س3: كيف أختبر تكامل Gemini API؟
**ج:**
```python
# backend/tests/integration/test_gemini_integration.py

import pytest
from app.integrations.gemini.client import GeminiClient

@pytest.mark.asyncio
async def test_gemini_api_connection():
    """اختبار الاتصال بـ Gemini API"""
    api_key = os.getenv("GEMINI_API_KEY")
    client = GeminiClient(api_key)

    # اختبار بسيط
    response = await client.generate(
        prompt="Say hello in one word",
        max_tokens=10
    )

    assert response is not None
    assert len(response) > 0
```

### س4: كيف أضيف ميزة جديدة؟
**ج:** اتبع هذا السير:

```bash
# 1. إنشاء فرع جديد
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# 2. تطوير الميزة
# - اكتب الكود
# - أضف الاختبارات
# - حدّث الوثائق

# 3. اختبر محلياً
# Backend
cd backend
pytest
black . --check
ruff check .

# Frontend
cd frontend
npm test
npm run lint

# 4. Commit
git add .
git commit -m "feat: add feature description"

# 5. Push وافتح PR
git push origin feature/feature-name
# افتح Pull Request على GitHub
```

### س5: ما هي أفضل ممارسات الأمان؟
**ج:**

#### 1. حماية Secrets
```python
# ❌ خطأ
api_key = "AIzaSyXXXXXXXXXXXXXXXXX"

# ✅ صحيح
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")
```

#### 2. تشفير البيانات الحساسة
```python
from cryptography.fernet import Fernet

# تشفير مفتاح API قبل الحفظ
encryption_key = os.getenv("ENCRYPTION_KEY")
cipher = Fernet(encryption_key.encode())
encrypted_api_key = cipher.encrypt(api_key.encode())

# حفظ encrypted_api_key في قاعدة البيانات
```

#### 3. استخدام Parameterized Queries
```python
# ❌ خطأ - SQL Injection
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ صحيح
from sqlalchemy import select
query = select(User).where(User.email == email)
```

#### 4. Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/sessions")
@limiter.limit("10/minute")
async def create_session():
    pass
```

#### 5. CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # محدد وليس "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### س6: كيف أتعامل مع الأخطاء من Gemini API؟
**ج:**

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
import httpx

class GeminiAPIError(Exception):
    """خطأ مخصص لـ Gemini API"""
    pass

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(httpx.HTTPError)
)
async def call_gemini_with_retry(prompt: str) -> str:
    """
    استدعاء Gemini API مع إعادة المحاولة التلقائية
    """
    try:
        response = await gemini_client.generate(prompt)
        return response
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            # Rate limit exceeded
            logger.warning("Rate limit exceeded, retrying...")
            raise  # سيعيد المحاولة
        elif e.response.status_code >= 500:
            # Server error
            logger.error(f"Gemini server error: {e}")
            raise  # سيعيد المحاولة
        else:
            # Client error (4xx)
            logger.error(f"Gemini client error: {e}")
            raise GeminiAPIError(f"Gemini API error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise GeminiAPIError(f"Unexpected error: {e}")
```

### س7: كيف أدير الحالة (State) في Frontend؟
**ج:** استخدم Zustand:

```typescript
// frontend/src/store/sessionStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SessionState {
  currentSession: Session | null;
  setCurrentSession: (session: Session) => void;
  fetchSession: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set) => ({
        currentSession: null,

        setCurrentSession: (session) => set({ currentSession: session }),

        fetchSession: async (id) => {
          const session = await sessionService.getById(id);
          set({ currentSession: session });
        },
      }),
      { name: 'session-storage' }
    )
  )
);

// الاستخدام في المكون
function SessionPage() {
  const { currentSession, fetchSession } = useSessionStore();

  useEffect(() => {
    fetchSession(sessionId);
  }, [sessionId]);

  return <div>{currentSession?.title}</div>;
}
```

### س8: كيف أنفذ WebSocket للتحديثات الفورية؟
**ج:**

#### Backend (FastAPI)
```python
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, set[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            for ws in self.active_connections[session_id]:
                await ws.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)

# إرسال تحديث
await manager.broadcast(session_id, {
    "type": "idea_generated",
    "payload": idea_data
})
```

#### Frontend (React)
```typescript
// frontend/src/hooks/useWebSocket.ts

import { useEffect, useRef } from 'react';

export function useWebSocket(sessionId: string) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/${sessionId}`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'idea_generated':
          // تحديث الـ state
          break;
        case 'review_completed':
          // تحديث الـ state
          break;
      }
    };

    return () => ws.current?.close();
  }, [sessionId]);

  return ws.current;
}
```

### س9: كيف أضيف وكيل جديد (Agent 12)؟
**ج:**

```bash
# 1. أضف ملف الإرشاد
backend/agent_guides/new_agent_guide.md

# 2. حدّث تكوين الوكلاء
# backend/app/config.py

AGENTS_CONFIG = {
    # ... الوكلاء الموجودين
    "new_agent": {
        "name": "New Agent",
        "guide_file": "new_agent_guide.md",
        "model": "gemini-2.5-pro",
        "temperature": 0.7,
        "max_tokens": 40000
    }
}

# 3. حدّث Database Model
# backend/app/models/agent.py
# أضف "new_agent" إلى ENUM

# 4. أنشئ Migration
alembic revision --autogenerate -m "add new agent type"
alembic upgrade head

# 5. اختبر
pytest tests/unit/test_agent_manager.py
```

### س10: كيف أستعد للنشر (Deployment)؟
**ج:**

```bash
# 1. تحديث المتغيرات البيئية
# أنشئ .env للإنتاج مع قيم آمنة

# 2. بناء Docker Images
docker-compose build

# 3. اختبار محلياً
docker-compose up

# 4. تشغيل الاختبارات
docker-compose exec backend pytest
docker-compose exec frontend npm test

# 5. تطبيق Migrations
docker-compose exec backend alembic upgrade head

# 6. النشر
# استخدم CI/CD pipeline أو
docker-compose -f docker-compose.prod.yml up -d

# 7. المراقبة
# تحقق من السجلات
docker-compose logs -f
```

---

## 11. خطة التنفيذ المرحلية / Phased Implementation Plan

### المرحلة 1: الإعداد الأساسي (Setup Phase) - يوم 1
```yaml
Tasks:
  ✅ إنشاء هيكل المجلدات (Backend + Frontend)
  ✅ إعداد Git repository + .gitignore
  ✅ إنشاء README.md أساسي
  ✅ إنشاء .env.example للـ Backend والـ Frontend
  ✅ إعداد Docker Compose الأولي
  ✅ تثبيت Python 3.11+ و Node.js 20+

Deliverables:
  - هيكل مشروع جاهز
  - Git repository مُهيأ
  - ملفات بيئة نموذجية
```

### المرحلة 2: Backend Core (2-3 أيام)
```yaml
Day 1:
  ✅ إعداد FastAPI + Uvicorn
  ✅ إعداد PostgreSQL + SQLAlchemy
  ✅ إعداد Redis للـ Caching
  ✅ إعداد Alembic للترحيلات
  ✅ Database Models:
      - User
      - APIKey

Day 2:
  ✅ نظام المصادقة:
      - User Registration
      - Login (JWT)
      - Password Hashing
      - Token Refresh
  ✅ API Endpoints:
      - POST /api/v1/auth/register
      - POST /api/v1/auth/login
      - POST /api/v1/auth/refresh
  ✅ اختبارات الوحدة للمصادقة

Day 3:
  ✅ Database Models المتبقية:
      - Session
      - Agent
      - CreativeBrief
      - Idea
      - Review
      - Tournament
      - TournamentTurn
      - FinalDecision
  ✅ إنشاء Migrations
  ✅ CRUD Operations الأساسية
  ✅ تشفير API Keys (Fernet)
```

### المرحلة 3: Agent System (3-4 أيام)
```yaml
Day 1:
  ✅ تكامل Gemini API:
      - GeminiClient class
      - Connection handling
      - Error handling
  ✅ Retry Logic with exponential backoff
  ✅ اختبار الاتصال بـ Gemini API

Day 2:
  ✅ Agent Manager:
      - قراءة ملفات guide
      - إنشاء الـ 11 وكيل
      - تخزين في قاعدة البيانات
  ✅ Prompt Engineering:
      - بناء Prompts مخصصة
      - دمج context

Day 3:
  ✅ Connection Pooling:
      - GeminiClientPool class
      - إدارة اتصالات متعددة
  ✅ Response Streaming:
      - بث الاستجابات الطويلة
  ✅ اختبارات التكامل للـ Agents

Day 4:
  ✅ تحسين الأداء:
      - Caching للـ Prompts
      - تحسين استعلامات قاعدة البيانات
  ✅ توثيق Agent System
```

### المرحلة 4: Orchestration Engine (4-5 أيام)
```yaml
Day 1:
  ✅ Session Management:
      - إنشاء جلسة جديدة
      - تتبع المراحل
      - إدارة الحالة
  ✅ Creative Brief:
      - استقبال وتحقق من البيانات
      - تخزين في قاعدة البيانات

Day 2:
  ✅ Idea Generation:
      - Story Architect يولد بنيتين
      - Character Development يطور الشخصيات
      - إنشاء فكرتين متكاملتين
  ✅ حفظ الأفكار في قاعدة البيانات

Day 3:
  ✅ Review System:
      - كل وكيل يراجع الفكرتين
      - حساب الدرجات (Quality, Novelty, Impact)
      - تخزين المراجعات
  ✅ اختبارات التكامل للمراجعات

Day 4:
  ✅ Tournament Manager:
      - إدارة 8 أدوار
      - اختيار المشاركين لكل دور
      - جمع الحجج
      - بناء السياق لكل وكيل

Day 5:
  ✅ Decision Engine:
      - تحليل الحجج
      - التصويت
      - تحديد الفائز
      - توليد التقرير النهائي
  ✅ اختبارات E2E للسير الكامل
```

### المرحلة 5: Frontend (5-6 أيام)
```yaml
Day 1:
  ✅ إعداد React + TypeScript + Vite
  ✅ إعداد Tailwind CSS + shadcn/ui
  ✅ إعداد React Router
  ✅ إعداد Zustand (State Management)
  ✅ إعداد Axios (API Client)

Day 2:
  ✅ UI Components الأساسية:
      - Button, Input, Dialog
      - Card, Badge, Progress
      - Toast notifications
  ✅ Layout Components:
      - Header
      - Sidebar
      - MainLayout

Day 3:
  ✅ Authentication Pages:
      - Login Page
      - Register Page
  ✅ Dashboard Page
  ✅ API Key Management UI

Day 4:
  ✅ Session Pages:
      - NewSession (Creative Brief Form)
      - SessionDetail
      - IdeaGeneration (عرض الفكرتين)
      - ReviewPhase (عرض المراجعات)

Day 5:
  ✅ Tournament Page:
      - عرض الأدوار
      - عرض الحجج
      - تتبع التقدم
  ✅ FinalDecision Page:
      - عرض التقرير
      - عرض التصويت

Day 6:
  ✅ WebSocket Integration:
      - useWebSocket hook
      - التحديثات الفورية
  ✅ History Page
  ✅ اختبارات المكونات
```

### المرحلة 6: Testing & Quality (3 أيام)
```yaml
Day 1:
  ✅ Unit Tests (Backend):
      - Services
      - Repositories
      - Utilities
  ✅ تحقق من تغطية > 80%

Day 2:
  ✅ Integration Tests (Backend):
      - API Endpoints
      - Database Operations
      - Gemini Integration
  ✅ E2E Tests (Backend):
      - Complete session workflow

Day 3:
  ✅ Frontend Tests:
      - Component tests
      - Integration tests
  ✅ E2E Tests (Playwright):
      - Complete user workflows
  ✅ Performance Testing
```

### المرحلة 7: Documentation (2 أيام)
```yaml
Day 1:
  ✅ docs/architecture.md
  ✅ docs/api.md
  ✅ docs/database-schema.md

Day 2:
  ✅ docs/deployment.md
  ✅ docs/security.md
  ✅ CONTRIBUTING.md
  ✅ تحديث README.md
```

### المرحلة 8: Deployment (2-3 أيام)
```yaml
Day 1:
  ✅ Docker Configuration:
      - Dockerfile للـ Backend
      - Dockerfile للـ Frontend
      - docker-compose.yml
      - docker-compose.prod.yml

Day 2:
  ✅ CI/CD Pipeline:
      - GitHub Actions
      - Automated Testing
      - Automated Deployment

Day 3:
  ✅ Production Setup:
      - Server Configuration
      - SSL Certificates
      - Environment Variables
  ✅ Monitoring:
      - Logging (Structlog)
      - Error Tracking (Sentry)
  ✅ Launch! 🚀
```

### الخط الزمني الإجمالي / Overall Timeline
```
المجموع: 20-25 يوم عمل (4-5 أسابيع)
```

---

## 12. معايير النجاح / Success Criteria

### معايير الجودة / Quality Standards

#### Code Quality
- ✅ Type Safety: TypeScript + Pydantic في كل مكان
- ✅ No Code Smells (وفقاً لـ SonarQube أو مشابه)
- ✅ Proper Error Handling: كل exception مُعالَج
- ✅ Comprehensive Comments: التعليقات في الأماكن المعقدة فقط

#### Performance
- ✅ API Response Time: < 500ms (95th percentile)
- ✅ Database Query Time: < 100ms (95th percentile)
- ✅ Page Load Time: < 2s (First Contentful Paint)
- ✅ WebSocket Latency: < 100ms

#### Security
- ✅ All Inputs Validated: باستخدام Pydantic و Zod
- ✅ API Keys Encrypted: باستخدام Fernet
- ✅ SQL Injection Protected: استخدام Parameterized Queries فقط
- ✅ XSS Protected: تنظيف جميع المدخلات
- ✅ CSRF Protected: استخدام CSRF Tokens

#### Testing
- ✅ Unit Test Coverage: > 80%
- ✅ All Critical Paths Tested: 100%
- ✅ E2E Tests: جميع التدفقات الرئيسية
- ✅ No Flaky Tests: جميع الاختبارات مستقرة

#### Documentation
- ✅ API Documentation: OpenAPI/Swagger كامل
- ✅ Code Comments: في الأماكن المهمة
- ✅ README Files: في كل مجلد رئيسي
- ✅ Deployment Guide: دليل خطوة بخطوة

### معايير الوظائف / Functional Criteria

#### المرحلة 1: Creative Brief
- ✅ يمكن للمستخدم إنشاء جلسة جديدة
- ✅ يمكن ملء جميع الحقول المطلوبة
- ✅ التحقق من صحة البيانات يعمل
- ✅ يتم حفظ البيانات بشكل صحيح

#### المرحلة 2: Idea Generation
- ✅ يتم توليد فكرتين متكاملتين
- ✅ كل فكرة تحتوي على جميع المكونات المطلوبة
- ✅ الوقت المتوقع: < 60 ثانية
- ✅ التحديثات الفورية عبر WebSocket

#### المرحلة 3: Independent Review
- ✅ جميع الـ 11 وكيل يراجعون الفكرتين
- ✅ كل مراجعة تحتوي على الدرجات الثلاثة
- ✅ الوقت المتوقع: < 90 ثانية
- ✅ التحديثات الفورية لكل مراجعة

#### المرحلة 4: Tournament
- ✅ 8 أدوار من النقاش
- ✅ كل دور يحتوي على حجج واضحة
- ✅ الوقت المتوقع لكل دور: < 15 ثانية
- ✅ التحديثات الفورية لكل دور

#### المرحلة 5: Final Decision
- ✅ يتم تحديد الفكرة الفائزة بوضوح
- ✅ التقرير النهائي شامل ومفصل
- ✅ تفصيل التصويت واضح
- ✅ التوصيات مفيدة وقابلة للتنفيذ

---

## 13. الملاحظات النهائية / Final Notes

### رسالة إلى Jules Agent / Message to Jules Agent

أنت الآن تملك كل المعلومات اللازمة لتنفيذ هذا المشروع الطموح. تذكر دائماً:

#### المبادئ الأساسية / Core Principles
1. **الجودة قبل السرعة** - كود نظيف أفضل من كود سريع
2. **الأمان قبل كل شيء** - لا تساوم على الأمان أبداً
3. **التوثيق المستمر** - وثّق أثناء العمل، ليس بعده
4. **الاختبار الشامل** - اختبر كل شيء، حتى الأمور البسيطة
5. **التواصل الواضح** - أبلغ عن التقدم والمشاكل بوضوح

#### عند مواجهة مشكلة / When Facing Issues
```
1. توقف وفكر - لا تتسرع في الحل
2. اقرأ الخطأ بعناية - الخطأ يحتوي على المعلومات
3. ابحث في الوثائق - الإجابة غالباً موجودة
4. جرب الحلول خطوة بخطوة - لا تغير أشياء كثيرة دفعة واحدة
5. اطلب المساعدة إذا لزم الأمر - لا تتردد
```

#### نصائح للنجاح / Tips for Success
- 🎯 **ابدأ بسيط** - نفذ أبسط نسخة أولاً، ثم طوّر
- 🧪 **اختبر باستمرار** - لا تنتظر حتى النهاية
- 📝 **وثّق الأخطاء** - سجل المشاكل والحلول
- 🔄 **راجع الكود** - راجع كودك بعد كتابته
- 💡 **تعلم من الأخطاء** - كل خطأ فرصة للتعلم

#### قائمة التحقق النهائية / Final Checklist

```yaml
قبل كل Commit:
  ☐ الكود يعمل بشكل صحيح
  ☐ الاختبارات تمر
  ☐ الكود منسق (Black/Prettier)
  ☐ لا توجد أخطاء Linting
  ☐ التعليقات محدثة
  ☐ رسالة Commit واضحة

قبل كل Pull Request:
  ☐ جميع الاختبارات تمر
  ☐ التغطية > 80%
  ☐ الوثائق محدثة
  ☐ لا توجد TODO متبقية
  ☐ مراجعة الكود الذاتية مكتملة
  ☐ الوصف واضح وشامل

قبل النشر:
  ☐ جميع الاختبارات تمر (Unit + Integration + E2E)
  ☐ اختبار الأداء مُرضي
  ☐ فحص الأمان مكتمل
  ☐ الوثائق كاملة
  ☐ النسخ الاحتياطي مُعد
  ☐ خطة Rollback جاهزة
```

---

## ملاحظة أخيرة / Final Note

هذا المشروع طموح ومعقد، لكنه قابل للتنفيذ بالكامل إذا اتبعت هذا الدليل خطوة بخطوة.

**تذكر**: أنت لست وحدك - هذا الدليل هو رفيقك في كل خطوة. ارجع إليه كلما احتجت.

**حظاً موفقاً يا Jules Agent! 🚀**

---

*آخر تحديث: 2025-01-10*
*الإصدار: 1.0.0*

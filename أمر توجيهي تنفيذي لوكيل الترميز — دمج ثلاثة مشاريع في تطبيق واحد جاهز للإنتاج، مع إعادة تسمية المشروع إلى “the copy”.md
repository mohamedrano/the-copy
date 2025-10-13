**أمر توجيهي تنفيذي لوكيل الترميز — دمج ثلاثة مشاريع في تطبيق واحد جاهز للإنتاج، مع إعادة تسمية المشروع إلى “the copy”**

---

## SYSTEM — دورك غير قابل للتفاوض

أنت «وكيل ترميز منفِّذ» يعمل محلياً على Windows (مسارات D:\ وK:) ويُنتِج مخرجات قابلة للتشغيل على Linux/CI. تنفيذك **ذرّي، حتمي، قابل للإعادة**، مع تسجيل تغييرات دقيقة، وفحوص بعد كل خطوة. تُنفِّذ ضمن مستودع التطبيق الرئيسي الحالي ثم تُعيد تسميته إلى **the copy**.

---

## OBJECTIVE — الهدف

1. دمج المشاريع الخارجية الثلاثة داخل التطبيق الرئيسي كـ SPAs مستقلة تُقدَّم تحت مسارات فرعية:

* `/drama-analyst/`، `/stations/`، `/multi-agent-story/`

2. جعل البناء والنشر محمولَين عبر Docker/Nginx وCI.
3. **إعادة تسمية المشروع بأكمله**—اسم الحزمة والملفات والـ README إلى **the copy** مع تصحيح “arabicy”.
4. الالتزام ببوابات جودة: TypeScript/Lint/Build/Smoke/E2E خفيفة.

---

## SCOPE — النطاق وحدود التنفيذ

* نطاق العمل داخل:
  `D:\arabicy-screenplay-editor\` (المجلد الذي سيصبح لاحقاً `D:\the-copy\`)
* مصادر خارجية للدمج (قراءة فقط، ونسخها إلى المستودع):

  * `K:\المشروع\the copy Drama-analyst\`
  * `K:\المشروع\the copy stations\`
  * `K:\المشروع\the-copy-Multi-agent-Story\`
* لا تعتمد أي خطوة نهائية على مسارات مطلقة عند البناء داخل Docker/CI.
* كل الأكواد والملفات الجديدة تُنشأ داخل المستودع الرئيسي، مع مجلّد `external/` لاستضافة المصادر المنسوخة.

---

## ENV — بيئة التنفيذ

* Node.js 20.x
* npm موحّد (بوجود `package-lock.json`).
* Git مُفعل.
* Docker / Docker Compose (اختباري).
* Windows محلي للتجهيز، وLinux في CI.

---

## NON-DESTRUCTIVE MODE — قواعد السلامة

* لا تحذف ملفات دون بديل/أرشفة.
* أي استبدال كامل لملف يتم إيداعه في كومِت منفصل برسالة واضحة.
* بعد كل خطوة:
  `npm run type-check` → `npm run lint` → `npm run build` (أو `npm run build:prod` عند اللزوم).

---

## VARIABLES — المتغيّرات القياسية

* ROOT := `D:\arabicy-screenplay-editor`
* NEW_ROOT := `D:\the-copy`
* EXT_DIR := `D:\arabicy-screenplay-editor\external` (ثم بعد إعادة التسمية: `D:\the-copy\external`)

---

## PLAN — تسلسل التنفيذ (assemble → grade → mix → render → export)

### 0) تحضير مسارات الدمج (assemble)

**خطوات:**

1. أنشئ مجلد الاستضافة للمشاريع الخارجية:

   * `external/drama-analyst/`
   * `external/stations/`
   * `external/multi-agent-story/`
2. انسخ محتوى المشاريع من الأقراص K:\ إلى هذه المجلدات (نسخ المصدر بالكامل بما فيه إعدادات البناء).

**ملفات/أوامر جديدة:**

* `scripts/import-external.ps1` (للاستخدام المحلي فقط، لا يُستدعى في CI) بمهمة نسخ من K:\ إلى `external/*`:

```powershell
Param(
  [string]$Drama = "K:\المشروع\the copy Drama-analyst",
  [string]$Stations = "K:\المشروع\the copy stations",
  [string]$Multi = "K:\المشروع\the-copy-Multi-agent-Story"
)
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path external\drama-analyst | Out-Null
New-Item -ItemType Directory -Force -Path external\stations | Out-Null
New-Item -ItemType Directory -Force -Path external\multi-agent-story | Out-Null

robocopy "$Drama" ".\external\drama-analyst" /MIR /XD node_modules .git .next dist coverage
robocopy "$Stations" ".\external\stations" /MIR /XD node_modules .git .next dist coverage
robocopy "$Multi" ".\external\multi-agent-story" /MIR /XD node_modules .git .next dist coverage

Write-Host "✅ Imported external sources."
```

**التزامات (Commits):**

* `chore(repo): add external directory and import script (PowerShell)`

**بوابات الجودة (سريعة):**

* تشغيل السكربت محلياً (اختياري الآن). لا بناء بعد.

---

### 1) إعادة تسمية المشروع إلى “the copy” (grade)

**هدف:** جعل الاسم الرسمي للحزمة والوثائق والترويسات “the copy”.

**تغييرات:**

1. **package.json**:

   * `"name": "the-copy"`
   * تحديث `"homepage"` إن وُجد.
2. **README.md / DOCUMENTATION.md / PRODUCTION_*:** استبدال “arabicy-screenplay-editor” بـ “the copy” مع تصحيح الإملاء.
3. **index.html**: عنوان الصفحة `<title>the copy</title>`.
4. **الملفات ذات الصلة بالأدوات** (`.vscode`, `.kilocode`, `.qodo`, `.roo`, `.amazonq`, إلخ): تحديث الإشارات الظاهرة للاسم الجديد حيث يلزم.
5. **ملف مساحة العمل**: `arabicy-screenplay-editor.code-workspace` → `the-copy.code-workspace` (تعديل المحتوى والاسم).

**اختياري (يتطلب تدخّل يدوي خارج نطاق الوكيل):** إعادة تسمية المجلد الفعلي من
`D:\arabicy-screenplay-editor` → `D:\the-copy`
ثم تحديث المسار في مستنداتك. إن تعذّر، أبقِ المجلد كما هو وأكمِل بتغييرات الاسم داخل المشروع.

**التزامات:**

* `chore(branding): rename project to 'the copy' and update docs/titles`

**بوابات الجودة:**

* `npm run type-check` و`npm run lint` و`npm run build` تمرّ.

---

### 2) ضبط قواعد البناء للمشاريع الخارجية (mix)

**هدف:** ضمان البناء تحت مسارات فرعية عبر تهيئة `base` وأُطر التوجيه.

**تغييرات داخل `external/*`:**

1. **Vite لكل مشروع خارجي**:

   * `external/drama-analyst/vite.config.ts`:

     ```ts
     import { defineConfig } from 'vite'
     export default defineConfig({ base: '/drama-analyst/' })
     ```
   * `external/stations/vite.config.ts`:

     ```ts
     import { defineConfig } from 'vite'
     export default defineConfig({ base: '/stations/' })
     ```
   * `external/multi-agent-story/vite.config.ts`:

     ```ts
     import { defineConfig } from 'vite'
     export default defineConfig({ base: '/multi-agent-story/' })
     ```
2. إن كان هناك React Router أو ما شابه: اضبط `basename` بما يطابق كل مسار فرعي.

**التزامات:**

* `fix(external): set Vite base paths for subpath deployment`

**بوابات الجودة:**

* لاحقاً سنبني خارجياً ونسخّن إلى `public/*`.

---

### 3) مكون الإطار وعرض الصفحات (render)

**ملفات جديدة/معدلة داخل `src/`:**

* `src/components/common/ExternalAppFrame.tsx` (مع تحميل/أخطاء/ملء شاشة):

```tsx
import React, { useState } from 'react';

interface ExternalAppFrameProps { title: string; url: string; }

export const ExternalAppFrame: React.FC<ExternalAppFrameProps> = ({ title, url }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex flex-col">
      {loading && !err && <div className="p-4 text-sm">...جاري التحميل</div>}
      {err && <div className="p-4 text-red-600 text-sm">فشل تحميل {title}: {err}</div>}

      <iframe
        src={url}
        title={title}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setErr('Network/Content error'); }}
        allow="fullscreen; clipboard-read; clipboard-write"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
};
```

* `src/components/ProjectsPage.tsx`:

```tsx
import React from 'react';
import { ExternalAppFrame } from './common/ExternalAppFrame';

export const ProjectsPage: React.FC = () => {
  return <ExternalAppFrame title="محلل الدراما" url="/drama-analyst/" />;
};
```

* `src/components/TemplatesPage.tsx`:

```tsx
import React from 'react';
import { ExternalAppFrame } from './common/ExternalAppFrame';

export const TemplatesPage: React.FC = () => {
  return <ExternalAppFrame title="المحطات" url="/stations/" />;
};
```

* `src/components/ExportPage.tsx`:

```tsx
import React from 'react';
import { ExternalAppFrame } from './common/ExternalAppFrame';

export const ExportPage: React.FC = () => {
  return <ExternalAppFrame title="قصة متعددة الوكلاء" url="/multi-agent-story/" />;
};
```

**التزامات:**

* `feat(ui): external app frame with loading/error/fullscreen`
* `feat(pages): wire projects/templates/export to embedded SPAs`

**بوابات الجودة:**

* `npm run type-check` → `npm run lint` → `npm run build`

---

### 4) سكربت بناء ونسخ المشاريع الخارجية إلى public (render)

**ملف:** `scripts/build-external-projects.js`

```js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projects = [
  { name: 'Drama Analyst', source: 'external/drama-analyst', target: 'public/drama-analyst' },
  { name: 'Stations', source: 'external/stations', target: 'public/stations' },
  { name: 'Multi-Agent Story', source: 'external/multi-agent-story', target: 'public/multi-agent-story' }
];

console.log('🚀 Building external projects...\n');
let hasErrors = false;

for (const p of projects) {
  console.log(`📦 Building ${p.name}...`);
  try {
    execSync('npm ci', { cwd: p.source, stdio: 'inherit' });
    execSync('npm run build', { cwd: p.source, stdio: 'inherit' });

    const distPath = path.join(p.source, 'dist');
    const targetPath = path.resolve(p.target);

    if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
    fs.mkdirSync(targetPath, { recursive: true });
    fs.cpSync(distPath, targetPath, { recursive: true });

    console.log(`✅ ${p.name} built and copied to ${p.target}\n`);
  } catch (e) {
    console.error(`❌ Error building ${p.name}:`, e?.message || e);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('❌ One or more external projects failed to build.');
  process.exit(1);
}
console.log('✅ All external projects built successfully!');
```

**التزامات:**

* `feat(build): add external projects build-and-copy script`

**بوابات الجودة:**

* `npm run build:external` ينجح محلّياً.

---

### 5) تحديث package.json والتهيئات (render)

**package.json — أضف/حدّث:**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "build:external": "node scripts/build-external-projects.js",
    "build:prod": "npm run build:external && npm run build",
    "docker:build": "docker build -t the-copy:latest .",
    "docker:run": "docker run -p 8080:80 the-copy:latest"
  }
}
```

**tsconfig.json — استثناءات:**

```json
{
  "exclude": [
    "node_modules",
    "dist",
    "public",
    "src/components/editor/ScreenplayEditor-original.tsx",
    "src/components/editor/ScreenplayEditor-backup.tsx"
  ]
}
```

**التزامات:**

* `chore(scripts): add build:external and build:prod; unify npm`
* `chore(ts): update tsconfig excludes`

**بوابات الجودة:**

* `npm run type-check` → `npm run lint` → `npm run build:prod`

---

### 6) Nginx محسن (render)

**ملف:** `nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "clipboard-read=(), clipboard-write=(self), fullscreen=(self)" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com https://*.googleapis.com; frame-ancestors 'self';" always;

    # لا تُخزّن HTML
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    location ~* ^/(drama-analyst|stations|multi-agent-story)/index\.html$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # أصول ثابتة طويلة الأمد
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /drama-analyst/ {
        alias /usr/share/nginx/html/drama-analyst/;
        try_files $uri $uri/ /drama-analyst/index.html;
    }
    location /stations/ {
        alias /usr/share/nginx/html/stations/;
        try_files $uri $uri/ /stations/index.html;
    }
    location /multi-agent-story/ {
        alias /usr/share/nginx/html/multi-agent-story/;
        try_files $uri $uri/ /multi-agent-story/index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /healthz {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**التزامات:**

* `feat(nginx): hardened CSP, permissions-policy, and html caching rules`

---

### 7) Dockerfile متعدد المراحل محمول (render → export)

**ملف:** `Dockerfile`

```dockerfile
# Stage 1: Build external apps
FROM node:20-alpine AS external-builder
WORKDIR /ext

# Drama Analyst
COPY external/drama-analyst/package*.json ./drama-analyst/
RUN cd drama-analyst && npm ci
COPY external/drama-analyst ./drama-analyst
RUN cd drama-analyst && npm run build

# Stations
COPY external/stations/package*.json ./stations/
RUN cd stations && npm ci
COPY external/stations ./stations
RUN cd stations && npm run build

# Multi-Agent Story
COPY external/multi-agent-story/package*.json ./multi-agent-story/
RUN cd multi-agent-story && npm ci
COPY external/multi-agent-story ./multi-agent-story
RUN cd multi-agent-story && npm run build

# Stage 2: Build main app
FROM node:20-alpine AS main-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY --from=external-builder /ext/drama-analyst/dist ./public/drama-analyst
COPY --from=external-builder /ext/stations/dist ./public/stations
COPY --from=external-builder /ext/multi-agent-story/dist ./public/multi-agent-story
RUN npm run build

# Stage 3: Nginx
FROM nginx:alpine
COPY --from=main-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache wget
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/healthz || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**التزامات:**

* `build(docker): multi-stage build with external apps and nginx healthcheck`

---

### 8) docker-compose للتشغيل المحلي (export)

**ملف:** `docker-compose.yml`

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/healthz"]
      interval: 30s
      timeout: 3s
      retries: 3
```

**التزامات:**

* `chore(devops): add docker-compose for local run`

---

### 9) GitHub Actions CI/CD (export)

**ملف:** `.github/workflows/build-and-deploy.yml`

```yaml
name: Build and Deploy
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Type check
      run: npm run type-check

    - name: Lint
      run: npm run lint

    - name: Build
      run: npm run build:prod

    - name: Set up QEMU
      uses: docker/setup-qemu-action@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Registry
      if: github.ref == 'refs/heads/main'
      uses: docker/login-action@v3
      with:
        registry: ${{ secrets.DOCKER_REGISTRY }}
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and Push
      uses: docker/build-push-action@v6
      with:
        context: .
        push: ${{ github.ref == 'refs/heads/main' }}
        tags: |
          ${{ secrets.DOCKER_REGISTRY }}/the-copy:latest
          ${{ secrets.DOCKER_REGISTRY }}/the-copy:${{ github.sha }}
```

**التزامات:**

* `ci: add build and docker publish pipeline with buildx`

---

### 10) اختبارات دخان خفيفة (render → export)

**ملف:** `tests/smoke.spec.ts` (Playwright أو بديل بسيط بـ node-fetch؛ هنا مثال Playwright مختصر)

> إن لم يكن Playwright مُضافاً، أضِف devDeps وأمر `test:smoke`.

```ts
import { test, expect } from '@playwright/test';

const routes = ['/', '/drama-analyst/', '/stations/', '/multi-agent-story/'];

for (const r of routes) {
  test(`smoke: ${r}`, async ({ page }) => {
    await page.goto(`http://localhost:8080${r}`);
    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    await expect(page).toHaveTitle(/the copy/i);
    expect(consoleErrors).toEqual([]);
  });
}
```

**التزامات:**

* `test(smoke): add basic route smoke tests`

---

### 11) README — البناء والتشغيل (export)

حدّث `README.md` بقسم “the copy — البناء والنشر” ويشمل:

* استيراد المشاريع (اختياري عبر PowerShell).
* `npm run build:external` → `npm run build` أو `npm run build:prod`.
* Docker: `npm run docker:build` → `npm run docker:run` ثم افتح `http://localhost:8080/`.
* مسارات:

  * `/drama-analyst/`
  * `/stations/`
  * `/multi-agent-story/`
  * `/healthz`

**التزامات:**

* `docs: update README for the copy build and routes`

---

## QUALITY GATES — بوابات الجودة الإلزامية

1. **TypeScript:** `npm run type-check` ينجح بلا أخطاء.
2. **Lint:** لا تحذيرات حرجة.
3. **Build:** `npm run build:prod` ينجح ويُنتِج `/dist`.
4. **Docker:** `npm run docker:build` و`npm run docker:run` يعملان، ويفتح `/` و المسارات الفرعية دون أخطاء.
5. **Smoke:** الاختبارات تمرّ دون أخطاء Console جسيمة.
6. **Routing/Caching:** HTML غير مخزّن، الأصول ثابتة مُهشَّة ومخزّنة طويل الأمد.
7. **Security Headers:** الترويسات مفعّلة؛ CSP متوافقة مع الاتصالات اللازمة.

---

## DELIVERABLES — المخرجات النهائية

* بنية المستودع (بعد الدمج) تتضمن:

  * `external/{drama-analyst, stations, multi-agent-story}` (مصادر)
  * `public/{drama-analyst, stations, multi-agent-story}` (مخرجات)
  * `scripts/build-external-projects.js`, `scripts/import-external.ps1`
  * `src/components/common/ExternalAppFrame.tsx` + الصفحات المعدلة
  * `nginx.conf`, `Dockerfile`, `docker-compose.yml`
  * `.github/workflows/build-and-deploy.yml`
  * README محدَّث بعنوان **the copy**

---

## COMMIT PROTOCOL — بروتوكول الالتزام

* التزم بعد كل خطوة برسالة واضحة كما ذُكر أعلاه.
* أضِف الوسم المناسب: `feat|fix|chore|build|ci|docs|test`.
* في النهاية، أنشئ تقرير تلخيصي `SUMMARY_OF_CHANGES.md` يذكر الملفات المُضافة/المعدلة ومسارات الاختبار ونتائج الدخان.

---

## ACCEPTANCE CRITERIA — معايير القبول

* التطبيق يحمل **the copy** كاسم وهوية.
* تحميل الصفحات الأربع بلا أخطاء: `/`, `/drama-analyst/`, `/stations/`, `/multi-agent-story/`.
* صورة Docker واحدة جاهزة، Healthcheck ناجح.
* CI يبني ويدفع الصورة عند الدفع إلى `main`.
* عدم وجود أخطاء TypeScript وفشل Lint حرِج.
* نجاح Smoke Tests.

---

## EXECUTE NOW — تعليمات التنفيذ الفورية (محلياً)

1. (اختياري) شغّل:
   `pwsh scripts/import-external.ps1`
2. `npm ci`
3. `npm run build:external`
4. `npm run build` أو `npm run build:prod`
5. `npm run docker:build` → `npm run docker:run` ثم تحقق يدوياً:

   * `http://localhost:8080/`
   * `http://localhost:8080/drama-analyst/`
   * `http://localhost:8080/stations/`
   * `http://localhost:8080/multi-agent-story/`
   * `http://localhost:8080/healthz`

نفِّذ التسلسل كما هو، بلا حذف أو تجاوز. عند أول فشل، أوقِف ونفّذ تصحيحاً أدنى حدّاً ثم أعد الفحوص الثلاثية (type-check → lint → build) قبل المتابعة.

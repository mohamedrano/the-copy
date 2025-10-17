# دليل النشر - The Copy

## نظرة عامة

هذا الدليل يوضح كيفية نشر **The Copy** في بيئات مختلفة، من التطوير إلى الإنتاج.

## المتطلبات

### الحد الأدنى
- Node.js 18.0.0+
- npm 9.0.0+
- 2GB RAM
- 10GB مساحة تخزين

### الموصى به
- Node.js 20.0.0+
- npm 10.0.0+
- 4GB RAM
- 20GB مساحة تخزين
- SSD للتخزين

## البيئات

### 1. بيئة التطوير (Development)

#### الإعداد
```bash
# استنساخ المستودع
git clone https://github.com/your-org/the-copy.git
cd the-copy

# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env.local

# تشغيل الخادم
npm run dev
```

#### متغيرات البيئة
```bash
# .env.local
VITE_APP_NAME=The Copy
VITE_APP_VERSION=0.0.0
VITE_GEMINI_API_KEY=your_api_key_here
VITE_DEBUG=true
VITE_DEV_SERVER_PORT=5177
```

#### الوصول
- **URL:** http://localhost:5177
- **Hot Reload:** مفعل
- **Source Maps:** مفعل

### 2. بيئة الاختبار (Staging)

#### الإعداد
```bash
# بناء التطبيق
npm run build

# تشغيل المعاينة
npm run preview
```

#### متغيرات البيئة
```bash
# .env.staging
VITE_APP_NAME=The Copy (Staging)
VITE_APP_VERSION=0.0.0
VITE_GEMINI_API_KEY=staging_api_key
VITE_DEBUG=false
VITE_API_BASE_URL=https://staging-api.the-copy.com
```

#### الوصول
- **URL:** http://localhost:4173
- **Hot Reload:** معطل
- **Source Maps:** معطل

### 3. بيئة الإنتاج (Production)

#### الإعداد
```bash
# فحص الجودة
npm run type-check
npm run lint
npm run test

# بناء الإنتاج
npm run build:prod

# تشغيل الخادم
npm start
```

#### متغيرات البيئة
```bash
# .env.production
VITE_APP_NAME=The Copy
VITE_APP_VERSION=1.0.0
VITE_GEMINI_API_KEY=production_api_key
VITE_DEBUG=false
VITE_API_BASE_URL=https://api.the-copy.com
VITE_ENABLE_ANALYTICS=true
```

## النشر باستخدام Docker

### 1. إنشاء Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. إعداد Nginx
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 3. بناء وتشغيل الحاوية
```bash
# بناء الصورة
docker build -t the-copy:latest .

# تشغيل الحاوية
docker run -d -p 80:80 --name the-copy-app the-copy:latest

# أو باستخدام docker-compose
docker-compose up -d
```

### 4. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./dist:/usr/share/nginx/html
    depends_on:
      - app
```

## النشر على منصات السحابة

### 1. Vercel

#### الإعداد
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

#### ملف التكوين
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Netlify

#### الإعداد
```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
netlify deploy --prod
```

#### ملف التكوين
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS S3 + CloudFront

#### الإعداد
```bash
# تثبيت AWS CLI
aws configure

# بناء التطبيق
npm run build

# رفع الملفات
aws s3 sync dist/ s3://your-bucket-name --delete

# إنشاء CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## النشر المستمر (CI/CD)

### 1. GitHub Actions

#### ملف Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

### 2. GitLab CI

#### ملف التكوين
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run type-check
    - npm run lint
    - npm run test
  only:
    - merge_requests
    - main

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://$S3_BUCKET --delete
  only:
    - main
  variables:
    S3_BUCKET: "your-bucket-name"
```

## مراقبة الأداء

### 1. مراقبة التطبيق
```typescript
// src/utils/monitoring.ts
export class PerformanceMonitor {
  static trackPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${loadTime}ms`);
    });
  }

  static trackUserAction(action: string) {
    // إرسال بيانات المراقبة
    console.log(`User action: ${action}`);
  }
}
```

### 2. مراقبة الأخطاء
```typescript
// src/utils/errorTracking.ts
export class ErrorTracker {
  static trackError(error: Error, context?: any) {
    console.error('Error tracked:', error, context);
    // إرسال الخطأ لخدمة المراقبة
  }

  static trackPromiseRejection(reason: any) {
    console.error('Promise rejected:', reason);
  }
}
```

## النسخ الاحتياطية

### 1. نسخ احتياطية للبيانات
```bash
# نسخ احتياطية يومية
0 2 * * * /usr/local/bin/backup-script.sh

# نسخ احتياطية أسبوعية
0 3 * * 0 /usr/local/bin/full-backup.sh
```

### 2. استعادة البيانات
```bash
# استعادة من النسخة الاحتياطية
./restore-script.sh backup-2024-12-01.tar.gz
```

## استكشاف الأخطاء

### 1. مشاكل شائعة

#### خطأ في البناء
```bash
# تنظيف cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### خطأ في النشر
```bash
# فحص المتغيرات
echo $VITE_GEMINI_API_KEY

# فحص الصلاحيات
ls -la dist/
```

### 2. سجلات الأخطاء
```bash
# سجلات Docker
docker logs the-copy-app

# سجلات Nginx
tail -f /var/log/nginx/error.log

# سجلات التطبيق
tail -f /var/log/the-copy/app.log
```

## الصيانة

### 1. تحديثات منتظمة
- **تحديث التبعيات** - شهرياً
- **تحديث النظام** - ربع سنوياً
- **مراجعة الأمان** - شهرياً

### 2. مراقبة الأداء
- **استخدام الذاكرة** - مراقبة مستمرة
- **استجابة الخادم** - مراقبة مستمرة
- **استخدام الشبكة** - مراقبة مستمرة

---

**نشر آمن وموثوق** 🚀
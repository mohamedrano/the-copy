# دليل النشر - The Copy Platform

## نظرة عامة

هذا الدليل يوضح كيفية نشر منصة The Copy في بيئة الإنتاج باستخدام Docker و Kubernetes.

## المتطلبات

### الخادم
- Ubuntu 20.04+ أو CentOS 8+
- 4 CPU cores على الأقل
- 8GB RAM على الأقل
- 50GB مساحة تخزين
- Docker 20.10+
- Docker Compose 2.0+

### الخدمات الخارجية
- PostgreSQL 14+
- Redis 6+
- Domain name مع SSL certificate

## إعداد البيئة

### 1. إعداد المتغيرات البيئية

إنشاء ملف `.env` في جذر المشروع:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/the_copy_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (يجب أن يكون 32 حرف على الأقل)
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-chars

# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Origins
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server Configuration
PORT=8000
HOST=0.0.0.0
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=15m

# Start Workers
START_WORKERS=true
```

### 2. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
sudo -u postgres createdb the_copy_db

# تشغيل migrations
cd apps/multi-agent-story/backend
npx prisma migrate deploy
npx prisma generate
```

### 3. إعداد Redis

```bash
# تثبيت Redis
sudo apt update
sudo apt install redis-server

# تشغيل Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## النشر باستخدام Docker

### 1. بناء الصورة

```bash
# بناء صورة الإنتاج
pnpm run docker:build

# أو باستخدام Docker مباشرة
docker build -f Dockerfile . -t the-copy-app:latest
```

### 2. تشغيل الحاوية

```bash
# تشغيل مع متغيرات البيئة
docker run -d \
  --name the-copy-app \
  -p 8080:80 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e REDIS_URL="redis://host:6379" \
  -e JWT_SECRET="your-secret-key" \
  -e GEMINI_API_KEY="your-api-key" \
  the-copy-app:latest
```

### 3. استخدام Docker Compose

إنشاء ملف `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/the_copy_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=the_copy_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  workers:
    build: .
    command: ["node", "dist/workers.js"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/the_copy_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - START_WORKERS=true
    depends_on:
      - db
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

تشغيل الخدمات:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## النشر باستخدام Kubernetes

### 1. إنشاء ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: the-copy-config
data:
  NODE_ENV: "production"
  PORT: "8000"
  HOST: "0.0.0.0"
```

### 2. إنشاء Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: the-copy-secrets
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  GEMINI_API_KEY: <base64-encoded-api-key>
```

### 3. إنشاء Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: the-copy-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: the-copy-app
  template:
    metadata:
      labels:
        app: the-copy-app
    spec:
      containers:
      - name: the-copy-app
        image: the-copy-app:latest
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: the-copy-config
        - secretRef:
            name: the-copy-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 4. إنشاء Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: the-copy-service
spec:
  selector:
    app: the-copy-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

## إعداد Nginx (اختياري)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## SSL Certificate

### باستخدام Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## مراقبة الصحة

### Health Checks

```bash
# فحص صحة التطبيق
curl http://localhost:8080/health

# فحص قاعدة البيانات
curl http://localhost:8080/api/health/db

# فحص Redis
curl http://localhost:8080/api/health/redis
```

### Logs

```bash
# عرض logs التطبيق
docker logs the-copy-app

# عرض logs العمال
docker logs the-copy-workers

# متابعة logs
docker logs -f the-copy-app
```

## النسخ الاحتياطي

### قاعدة البيانات

```bash
# إنشاء نسخة احتياطية
pg_dump -h localhost -U postgres the_copy_db > backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة النسخة الاحتياطية
psql -h localhost -U postgres the_copy_db < backup_file.sql
```

### Redis

```bash
# نسخ احتياطي لـ Redis
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis_$(date +%Y%m%d_%H%M%S).rdb
```

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة DATABASE_URL
   - تحقق من تشغيل PostgreSQL
   - تأكد من وجود قاعدة البيانات

2. **خطأ في الاتصال بـ Redis**
   - تأكد من صحة REDIS_URL
   - تحقق من تشغيل Redis
   - تأكد من إعدادات الشبكة

3. **مشاكل في JWT**
   - تأكد من أن JWT_SECRET طوله 32 حرف على الأقل
   - تحقق من إعدادات الكوكيز

4. **مشاكل في العمال (Workers)**
   - تأكد من تعيين START_WORKERS=true
   - تحقق من logs العمال
   - تأكد من اتصال Redis

### Commands مفيدة

```bash
# إعادة تشغيل الخدمات
docker-compose restart

# إعادة بناء الصور
docker-compose build --no-cache

# عرض حالة الخدمات
docker-compose ps

# تنظيف الحاويات القديمة
docker system prune -a
```

## الأمان

### أفضل الممارسات

1. **استخدم HTTPS دائماً**
2. **غير كلمات المرور الافتراضية**
3. **قم بتحديث النظام بانتظام**
4. **استخدم firewall**
5. **راقب logs الأمان**
6. **قم بنسخ احتياطية منتظمة**

### Firewall Rules

```bash
# السماح بـ SSH
sudo ufw allow ssh

# السماح بـ HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# السماح بـ PostgreSQL (من localhost فقط)
sudo ufw allow from 127.0.0.1 to any port 5432

# تفعيل Firewall
sudo ufw enable
```

## الدعم

للحصول على المساعدة:
- تحقق من [GitHub Issues](https://github.com/your-org/the-copy/issues)
- راجع [وثائق التطوير](CONTRIBUTING.md)
- تواصل مع فريق الدعم

---

**ملاحظة**: تأكد من اختبار جميع الإعدادات في بيئة التطوير قبل النشر في الإنتاج.

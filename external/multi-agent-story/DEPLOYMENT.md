# دليل النشر للبيئة الإنتاجية - Jules Platform
# Production Deployment Guide - Jules Platform

## المتطلبات الأساسية / Prerequisites

- Docker & Docker Compose مثبتان على الخادم
- دومين (اختياري للـ SSL)
- شهادة SSL (Let's Encrypt موصى بها)

## خطوات النشر / Deployment Steps

### 1. تجهيز البيئة / Environment Setup

انسخ ملف `.env.production.example` إلى `.env` وقم بتحديث القيم:

```bash
cp .env.production.example .env
nano .env  # أو استخدم محرر نصوص آخر
```

**قيم مهمة يجب تغييرها / Important values to change:**

- `POSTGRES_PASSWORD`: كلمة مرور قوية لقاعدة البيانات
- `JWT_SECRET`: مفتاح سري قوي (32 حرف على الأقل)
- `ENCRYPTION_KEY`: مفتاح تشفير قوي
- `CORS_ORIGIN`: عنوان الدومين الخاص بك
- `VITE_API_URL`: عنوان API الخاص بك
- `VITE_WS_URL`: عنوان WebSocket الخاص بك

**توليد مفاتيح سرية قوية / Generate strong secrets:**

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

### 2. بناء وتشغيل الحاويات / Build and Start Containers

```bash
# بناء الحاويات / Build containers
docker-compose -f docker-compose.prod.yml build

# تشغيل في الخلفية / Start in background
docker-compose -f docker-compose.prod.yml up -d

# متابعة السجلات / View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. التحقق من الصحة / Health Check

```bash
# التحقق من حالة الخدمات / Check services status
docker-compose -f docker-compose.prod.yml ps

# اختبار الـ Backend API
curl http://localhost:8000/health

# اختبار الـ Frontend
curl http://localhost:80
```

### 4. إعداد SSL باستخدام Nginx Reverse Proxy (اختياري) / SSL Setup with Nginx Reverse Proxy (Optional)

قم بإنشاء ملف `nginx-proxy.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. إعداد شهادة SSL باستخدام Let's Encrypt / SSL Certificate with Let's Encrypt

```bash
# تثبيت Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# الحصول على الشهادة
sudo certbot --nginx -d yourdomain.com

# تجديد تلقائي
sudo certbot renew --dry-run
```

## الصيانة / Maintenance

### تحديث التطبيق / Update Application

```bash
# سحب آخر التغييرات / Pull latest changes
git pull origin main

# إعادة البناء والتشغيل / Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d

# إزالة الصور القديمة / Clean up old images
docker image prune -f
```

### النسخ الاحتياطي لقاعدة البيانات / Database Backup

```bash
# نسخ احتياطي / Backup
docker exec jules-postgres-prod pg_dump -U jules_user jules_db_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة / Restore
docker exec -i jules-postgres-prod psql -U jules_user jules_db_prod < backup_file.sql
```

### عرض السجلات / View Logs

```bash
# جميع الخدمات / All services
docker-compose -f docker-compose.prod.yml logs -f

# خدمة محددة / Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### إيقاف وإزالة الحاويات / Stop and Remove Containers

```bash
# إيقاف / Stop
docker-compose -f docker-compose.prod.yml stop

# إيقاف وإزالة / Stop and remove
docker-compose -f docker-compose.prod.yml down

# إزالة مع البيانات (حذر!) / Remove with data (Warning!)
docker-compose -f docker-compose.prod.yml down -v
```

## المراقبة / Monitoring

### فحص صحة الخدمات / Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database connection
docker exec jules-postgres-prod pg_isready -U jules_user

# Redis connection
docker exec jules-redis-prod redis-cli ping
```

### استخدام الموارد / Resource Usage

```bash
# عرض استخدام الموارد / View resource usage
docker stats

# عرض مساحة القرص / Check disk space
docker system df
```

## الأمان / Security

### قائمة التحقق الأمنية / Security Checklist

- ✅ تغيير جميع كلمات المرور الافتراضية
- ✅ استخدام HTTPS/SSL في الإنتاج
- ✅ تفعيل جدار الحماية (UFW/Firewall)
- ✅ تقييد الوصول إلى المنافذ (فقط 80, 443)
- ✅ نسخ احتياطي منتظم لقاعدة البيانات
- ✅ مراقبة السجلات للأنشطة المشبوهة
- ✅ تحديث الحاويات والتبعيات بانتظام

### إعدادات الجدار الناري / Firewall Settings

```bash
# تفعيل UFW
sudo ufw enable

# السماح بـ SSH
sudo ufw allow ssh

# السماح بـ HTTP و HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# عرض الحالة
sudo ufw status
```

## استكشاف الأخطاء / Troubleshooting

### مشاكل شائعة / Common Issues

**1. فشل الاتصال بقاعدة البيانات / Database connection failed**
```bash
# التحقق من حالة PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# التحقق من المتغيرات البيئية
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

**2. Frontend لا يتصل بـ Backend / Frontend can't connect to backend**
- تحقق من `VITE_API_URL` في `.env`
- تحقق من إعدادات CORS في Backend
- تحقق من إعدادات Nginx إذا كنت تستخدمه

**3. WebSocket لا يعمل / WebSocket not working**
- تحقق من `VITE_WS_URL` في `.env`
- تحقق من إعدادات Nginx للـ WebSocket
- تحقق من السجلات: `docker-compose -f docker-compose.prod.yml logs backend`

## الدعم / Support

للمزيد من المساعدة، راجع:
- [CLAUDE.md](CLAUDE.md) - دليل التطوير
- [README.md](README.md) - نظرة عامة على المشروع

# 🚀 دليل النشر للإنتاج - نظام Stations

## 📋 نظرة عامة

هذا الدليل يوضح كيفية إعداد ونشر نظام Stations في بيئة الإنتاج بأمان وكفاءة.

## ✅ قائمة التحقق قبل النشر

### 1. إعداد البيئة
- [ ] نسخ `env.example` إلى `.env` وتعديل القيم
- [ ] تعيين `GEMINI_API_KEY` الصحيح
- [ ] تعيين `DATABASE_URL` للإنتاج
- [ ] تعيين `VALID_API_KEYS` للمفاتيح الصحيحة
- [ ] تعيين `SESSION_SECRET` قوي (32+ حرف)
- [ ] تعيين `ALLOWED_ORIGINS` للمواقع المسموحة

### 2. الأمان
- [ ] تحديث جميع الاعتماديات
- [ ] تشغيل `npm audit` وإصلاح الثغرات
- [ ] تعيين HTTPS في الإنتاج
- [ ] إعداد firewall مناسب
- [ ] تعيين rate limiting مناسب

### 3. الأداء
- [ ] تشغيل `npm run build` بنجاح
- [ ] فحص حجم الحزم
- [ ] اختبار الأداء تحت الحمل
- [ ] إعداد Redis للتخزين المؤقت
- [ ] تحسين استعلامات قاعدة البيانات

### 4. الاختبارات
- [ ] تشغيل `npm run test` بنجاح
- [ ] تحقيق تغطية اختبارية 80%+
- [ ] تشغيل اختبارات الأداء
- [ ] اختبار الأمان

## 🛠️ خطوات النشر

### 1. إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# تثبيت PostgreSQL (إذا لم تكن موجودة)
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
sudo -u postgres psql
CREATE DATABASE stations_production;
CREATE USER stations_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE stations_production TO stations_user;
\q

# تشغيل migrations
npm run db:push
```

### 3. إعداد التطبيق

```bash
# نسخ المشروع
git clone <repository-url>
cd stations

# تثبيت الاعتماديات
npm ci --only=production

# نسخ ملف البيئة
cp env.example .env
# تعديل .env بالقيم الصحيحة

# بناء التطبيق
npm run build

# اختبار البناء
npm run check
```

### 4. إعداد PM2

```bash
# تثبيت PM2
npm install -g pm2

# إنشاء ملف PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'stations-app',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# تشغيل التطبيق
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. إعداد Nginx

```bash
# تثبيت Nginx
sudo apt install nginx -y

# إنشاء ملف التكوين
sudo cat > /etc/nginx/sites-available/stations << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # إعادة توجيه HTTP إلى HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # شهادات SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # إعدادات SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # ضغط الاستجابات
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # الأصول الثابتة
    location /assets/ {
        alias /path/to/stations/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # التطبيق الرئيسي
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/stations /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. إعداد SSL

```bash
# استخدام Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 📊 المراقبة والصيانة

### 1. مراقبة الأداء

```bash
# مراقبة PM2
pm2 monit

# مراقبة الذاكرة
pm2 logs --lines 100

# إعادة تشغيل التطبيق
pm2 restart stations-app

# تحديث التطبيق
pm2 reload stations-app
```

### 2. مراقبة النظام

```bash
# مراقبة استخدام الموارد
htop
iostat -x 1
free -h

# مراقبة قاعدة البيانات
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# مراقبة Redis
redis-cli info memory
```

### 3. النسخ الاحتياطي

```bash
# نسخ احتياطي لقاعدة البيانات
pg_dump stations_production > backup_$(date +%Y%m%d_%H%M%S).sql

# نسخ احتياطي للتطبيق
tar -czf stations_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/stations
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة

1. **التطبيق لا يبدأ**
   ```bash
   # فحص الأخطاء
   pm2 logs stations-app --err
   
   # فحص متغيرات البيئة
   pm2 env 0
   ```

2. **مشاكل قاعدة البيانات**
   ```bash
   # فحص الاتصال
   psql -h localhost -U stations_user -d stations_production
   
   # فحص الجداول
   \dt
   ```

3. **مشاكل Redis**
   ```bash
   # فحص حالة Redis
   redis-cli ping
   
   # فحص الذاكرة
   redis-cli info memory
   ```

4. **مشاكل الأداء**
   ```bash
   # فحص الطلبات البطيئة
   pm2 logs stations-app | grep "Slow request"
   
   # فحص استخدام الذاكرة
   pm2 monit
   ```

## 📈 تحسين الأداء

### 1. تحسين قاعدة البيانات

```sql
-- إنشاء فهارس للاستعلامات المتكررة
CREATE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_relationships_source ON relationships(source);
CREATE INDEX idx_relationships_target ON relationships(target);
CREATE INDEX idx_conflicts_stage ON conflicts(current_stage);

-- تحليل الاستعلامات
EXPLAIN ANALYZE SELECT * FROM characters WHERE name ILIKE '%test%';
```

### 2. تحسين Redis

```bash
# إعدادات Redis محسنة
sudo nano /etc/redis/redis.conf

# تعيين maxmemory
maxmemory 256mb
maxmemory-policy allkeys-lru

# إعادة تشغيل Redis
sudo systemctl restart redis-server
```

### 3. تحسين Nginx

```nginx
# إعدادات Nginx محسنة
worker_processes auto;
worker_connections 1024;

# تحسين التخزين المؤقت
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;
```

## 🔒 الأمان

### 1. تحديثات الأمان

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تحديث الاعتماديات
npm audit
npm audit fix

# فحص الثغرات
npm audit --audit-level moderate
```

### 2. مراقبة الأمان

```bash
# فحص محاولات الدخول
sudo tail -f /var/log/auth.log

# فحص طلبات Nginx
sudo tail -f /var/log/nginx/access.log | grep -E "(40[0-9]|50[0-9])"

# فحص استخدام الموارد
sudo netstat -tulpn | grep :5000
```

## 📋 قائمة المراجعة الدورية

### يومياً
- [ ] فحص حالة التطبيق
- [ ] مراقبة استخدام الموارد
- [ ] فحص الأخطاء في السجلات
- [ ] مراقبة الأداء

### أسبوعياً
- [ ] تحديث الاعتماديات
- [ ] فحص النسخ الاحتياطي
- [ ] تحليل الأداء
- [ ] فحص الأمان

### شهرياً
- [ ] تحديث النظام
- [ ] مراجعة السجلات
- [ ] تحسين قاعدة البيانات
- [ ] اختبار الاسترداد

## 🆘 الدعم والمساعدة

### السجلات المهمة
- تطبيق: `pm2 logs stations-app`
- Nginx: `/var/log/nginx/error.log`
- النظام: `/var/log/syslog`
- قاعدة البيانات: `/var/log/postgresql/`

### معلومات النظام
- إصدار Node.js: `node --version`
- إصدار npm: `npm --version`
- إصدار PM2: `pm2 --version`
- حالة الخدمات: `systemctl status nginx postgresql redis-server`

### الاتصال
- للدعم التقني: [contact@example.com]
- للطوارئ: [emergency@example.com]
- الوثائق: [docs.example.com]

---

## 📝 ملاحظات إضافية

- تأكد من اختبار جميع الوظائف بعد النشر
- راقب الأداء في الأيام الأولى
- احتفظ بنسخ احتياطية منتظمة
- وثق أي تغييرات في النظام
- راقب السجلات بانتظام

**تاريخ آخر تحديث:** $(date)
**الإصدار:** 1.0.0


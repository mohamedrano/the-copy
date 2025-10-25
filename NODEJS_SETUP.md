# إعداد Node.js - Node.js Setup

## المشكلة
المشروع يتطلب Node.js ≥20.19.0 ولكن الإصدار الحالي أقل من ذلك.

## الحلول

### الحل الأول: استخدام nvm (الأفضل)

```bash
# تثبيت nvm إذا لم يكن مثبت
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# إعادة تحميل الـ shell
source ~/.bashrc

# تثبيت أحدث إصدار من Node.js 20
nvm install 20.19.0
nvm use 20.19.0

# جعله الإصدار الافتراضي
nvm alias default 20.19.0
```

### الحل الثاني: تحديث Node.js مباشرة

#### على Ubuntu/Debian:
```bash
# إضافة مستودع NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# تثبيت Node.js
sudo apt-get install -y nodejs
```

#### على macOS:
```bash
# باستخدام Homebrew
brew install node@20

# أو تحديث الإصدار الحالي
brew upgrade node
```

### الحل الثالث: استخدام Docker (للتطوير)

```bash
# إنشاء Dockerfile
cat > Dockerfile << EOF
FROM node:20.19.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9002
CMD ["npm", "run", "dev"]
EOF

# بناء وتشغيل الحاوية
docker build -t the-copy-frontend .
docker run -p 9002:9002 the-copy-frontend
```

## التحقق من الإصدار

```bash
# التحقق من إصدار Node.js
node --version

# يجب أن يظهر v20.19.0 أو أحدث
```

## استكمال التثبيت

بعد تحديث Node.js:

```bash
cd frontend
npm install
npm run dev
```
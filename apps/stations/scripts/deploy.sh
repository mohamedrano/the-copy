#!/bin/bash

# ===========================================
# سكريبت النشر للإنتاج - نظام Stations
# ===========================================

set -e  # إيقاف السكريبت عند حدوث خطأ

# الألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة الطباعة الملونة
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# دالة التحقق من وجود الأمر
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# دالة التحقق من وجود الملف
check_file() {
    if [ ! -f "$1" ]; then
        print_error "File $1 not found!"
        exit 1
    fi
}

# دالة النسخ الاحتياطي
backup_database() {
    print_status "Creating database backup..."
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if command -v pg_dump &> /dev/null; then
        pg_dump $DATABASE_URL > $backup_file
        print_success "Database backup created: $backup_file"
    else
        print_warning "pg_dump not found, skipping database backup"
    fi
}

# دالة التحقق من البيئة
check_environment() {
    print_status "Checking environment..."
    
    # التحقق من وجود ملف البيئة
    if [ ! -f ".env" ]; then
        print_error ".env file not found! Please create it from env.example"
        exit 1
    fi
    
    # التحقق من المتغيرات المطلوبة
    source .env
    
    if [ -z "$GEMINI_API_KEY" ]; then
        print_error "GEMINI_API_KEY is not set in .env"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL is not set in .env"
        exit 1
    fi
    
    if [ -z "$VALID_API_KEYS" ]; then
        print_error "VALID_API_KEYS is not set in .env"
        exit 1
    fi
    
    if [ -z "$SESSION_SECRET" ]; then
        print_error "SESSION_SECRET is not set in .env"
        exit 1
    fi
    
    print_success "Environment check passed"
}

# دالة تثبيت الاعتماديات
install_dependencies() {
    print_status "Installing dependencies..."
    
    # تثبيت الاعتماديات للإنتاج
    npm ci --only=production --silent
    
    print_success "Dependencies installed"
}

# دالة بناء التطبيق
build_application() {
    print_status "Building application..."
    
    # فحص TypeScript
    print_status "Checking TypeScript..."
    npm run check
    
    # فحص ESLint
    print_status "Running ESLint..."
    npm run lint
    
    # بناء التطبيق
    print_status "Building application..."
    npm run build
    
    print_success "Application built successfully"
}

# دالة تشغيل الاختبارات
run_tests() {
    print_status "Running tests..."
    
    # تشغيل الاختبارات
    npm run test
    
    # تشغيل اختبارات التغطية
    print_status "Running coverage tests..."
    npm run test:coverage
    
    print_success "All tests passed"
}

# دالة تحديث قاعدة البيانات
update_database() {
    print_status "Updating database..."
    
    # تشغيل migrations
    npm run db:push
    
    print_success "Database updated"
}

# دالة إعادة تشغيل الخدمات
restart_services() {
    print_status "Restarting services..."
    
    # إعادة تشغيل PM2
    if command -v pm2 &> /dev/null; then
        pm2 restart stations-app || pm2 start ecosystem.config.js
        print_success "PM2 restarted"
    fi
    
    # إعادة تشغيل Nginx
    if command -v nginx &> /dev/null; then
        sudo systemctl reload nginx
        print_success "Nginx reloaded"
    fi
    
    print_success "Services restarted"
}

# دالة التحقق من صحة التطبيق
health_check() {
    print_status "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:5000/health > /dev/null; then
            print_success "Application is healthy"
            return 0
        fi
        
        print_status "Health check attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# دالة تنظيف الملفات المؤقتة
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # حذف الملفات المؤقتة
    rm -rf node_modules/.cache
    rm -rf dist/.cache
    
    print_success "Cleanup completed"
}

# دالة عرض المساعدة
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-tests      Skip running tests"
    echo "  --skip-backup     Skip database backup"
    echo "  --skip-build      Skip building application"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                # Full deployment"
    echo "  $0 --skip-tests   # Deploy without running tests"
    echo "  $0 --skip-backup  # Deploy without database backup"
}

# المتغيرات
SKIP_TESTS=false
SKIP_BACKUP=false
SKIP_BUILD=false

# معالجة المعاملات
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# ===========================================
# بداية السكريبت
# ===========================================

print_status "Starting deployment process..."

# التحقق من الأوامر المطلوبة
check_command "node"
check_command "npm"

# التحقق من البيئة
check_environment

# النسخ الاحتياطي (إذا لم يتم تخطيه)
if [ "$SKIP_BACKUP" = false ]; then
    backup_database
fi

# تثبيت الاعتماديات
install_dependencies

# بناء التطبيق (إذا لم يتم تخطيه)
if [ "$SKIP_BUILD" = false ]; then
    build_application
fi

# تشغيل الاختبارات (إذا لم يتم تخطيه)
if [ "$SKIP_TESTS" = false ]; then
    run_tests
fi

# تحديث قاعدة البيانات
update_database

# إعادة تشغيل الخدمات
restart_services

# التحقق من صحة التطبيق
health_check

# تنظيف الملفات المؤقتة
cleanup

print_success "Deployment completed successfully!"
print_status "Application is running at: http://localhost:5000"
print_status "Health check: http://localhost:5000/health"

# عرض معلومات إضافية
print_status "Useful commands:"
echo "  pm2 logs stations-app    # View application logs"
echo "  pm2 monit               # Monitor application"
echo "  pm2 restart stations-app # Restart application"
echo "  sudo systemctl status nginx # Check Nginx status"


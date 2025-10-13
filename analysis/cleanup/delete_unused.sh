#!/bin/bash
# سكربت Bash لحذف الملفات غير المستخدمة
# Arabic Screenplay Editor - Cleanup Script
#
# تشغيل آمن: ./delete_unused.sh
# تنفيذ فعلي: ./delete_unused.sh confirm

# ألوان للعرض
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# تحديد وضع التشغيل
DRY_RUN=1
if [ "$1" = "confirm" ]; then
    DRY_RUN=0
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}Arabic Screenplay Editor - Cleanup Script${NC}"
echo -e "${BLUE}=======================================${NC}"

# مسار المشروع
PROJECT_ROOT="H:/arabic-screenplay-editor"

# قائمة الملفات المرشحة للحذف
declare -a DELETE_TARGETS=(
    "$PROJECT_ROOT/dist:Directory:مخرجات البناء قابلة للإعادة:Low"
    "$PROJECT_ROOT/node_modules:Directory:تبعيات قابلة للتثبيت مجدداً:Low"
    "$PROJECT_ROOT/requirements.txt:File:متطلبات Python في مشروع Node.js:Low"
    "$PROJECT_ROOT/.qoderignore:File:ملف تكوين لأداة غير واضحة:Low"
)

# قائمة الملفات المرشحة للنقل
declare -a MOVE_TARGETS=(
    "$PROJECT_ROOT/src/agents:$PROJECT_ROOT/archive/agents-excluded:مستبعد من التكوين ولا يُستخدم"
    "$PROJECT_ROOT/src/config:$PROJECT_ROOT/archive/config-excluded:مستبعد من التكوين ولا يُستخدم"
    "$PROJECT_ROOT/scripts:$PROJECT_ROOT/archive/analysis-scripts:سكربتات Python غير مرتبطة بالمشروع"
)

# عرض الملخص
echo -e "\n${YELLOW}ملخص العملية:${NC}"
echo -e "${YELLOW}الملفات المرشحة للحذف: ${#DELETE_TARGETS[@]}${NC}"
echo -e "${YELLOW}الملفات المرشحة للنقل: ${#MOVE_TARGETS[@]}${NC}"

if [ $DRY_RUN -eq 1 ]; then
    echo -e "\n${GREEN}[وضع المعاينة - لن يتم حذف أي شيء]${NC}"
    echo -e "${GREEN}لتنفيذ العملية فعلياً، استخدم: ./delete_unused.sh confirm${NC}"
else
    echo -e "\n${RED}[وضع التنفيذ - سيتم تطبيق التغييرات]${NC}"
fi

echo -e "\n${BLUE}--- ملفات الحذف ---${NC}"

# معالجة ملفات الحذف
for target in "${DELETE_TARGETS[@]}"; do
    IFS=':' read -r path type reason risk <<< "$target"

    if [ -e "$path" ]; then
        status="${RED}[موجود]${NC}"
        size=""
        if [ -d "$path" ]; then
            size=$(du -sh "$path" 2>/dev/null | cut -f1)
            size=" (حجم: $size)"
        fi

        echo -e "$status $path$size"
        echo -e "  ${YELLOW}السبب: $reason${NC}"
        echo -e "  ${YELLOW}المخاطر: $risk${NC}"

        if [ $DRY_RUN -eq 0 ]; then
            if rm -rf "$path" 2>/dev/null; then
                echo -e "  ${GREEN}✓ تم الحذف${NC}"
            else
                echo -e "  ${RED}✗ فشل الحذف${NC}"
            fi
        fi
    else
        echo -e "${GREEN}[غير موجود]${NC} $path"
        echo -e "  ${YELLOW}السبب: $reason${NC}"
    fi
    echo ""
done

echo -e "${BLUE}--- ملفات النقل ---${NC}"

# معالجة ملفات النقل
for target in "${MOVE_TARGETS[@]}"; do
    IFS=':' read -r source dest reason <<< "$target"

    if [ -e "$source" ]; then
        status="${YELLOW}[موجود]${NC}"

        echo -e "$status $source"
        echo -e "  ${BLUE}إلى: $dest${NC}"
        echo -e "  ${YELLOW}السبب: $reason${NC}"

        if [ $DRY_RUN -eq 0 ]; then
            # إنشاء مجلد الوجهة إذا لم يكن موجوداً
            dest_dir=$(dirname "$dest")
            mkdir -p "$dest_dir" 2>/dev/null

            if mv "$source" "$dest" 2>/dev/null; then
                echo -e "  ${GREEN}✓ تم النقل${NC}"
            else
                echo -e "  ${RED}✗ فشل النقل${NC}"
            fi
        fi
    else
        echo -e "${GREEN}[غير موجود]${NC} $source"
        echo -e "  ${YELLOW}السبب: $reason${NC}"
    fi
    echo ""
done

# إحصائيات نهائية
total_items=$((${#DELETE_TARGETS[@]} + ${#MOVE_TARGETS[@]}))
echo -e "${BLUE}=======================================${NC}"
echo -e "${YELLOW}إجمالي العناصر المعالجة: $total_items${NC}"

if [ $DRY_RUN -eq 1 ]; then
    echo -e "${GREEN}لتنفيذ العملية فعلياً، استخدم: ./delete_unused.sh confirm${NC}"
else
    echo -e "${GREEN}تمت العملية بنجاح!${NC}"
    echo -e "${YELLOW}لا تنس تشغيل 'npm install' لإعادة تثبيت التبعيات${NC}"
fi

echo -e "${BLUE}=======================================${NC}"
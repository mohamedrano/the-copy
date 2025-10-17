#!/bin/bash

# سكربت تنفيذ تنظيف آمن
# يقرأ تقرير الأدلة وينفذ الحذف مع نسخة احتياطية

set -e

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# متغيرات
DRY_RUN=${1:-"--dry-run"}
BACKUP_DIR="cleanup/_backup"
REPORT_FILE="cleanup/trash_report.jsonl"

echo -e "${GREEN}🧹 بدء عملية تنظيف هيكل المشروع${NC}"
echo "=================================="

# التحقق من وجود تقرير الأدلة
if [ ! -f "$REPORT_FILE" ]; then
    echo -e "${RED}❌ خطأ: لا يوجد تقرير الأدلة في $REPORT_FILE${NC}"
    exit 1
fi

# إنشاء مجلد النسخة الاحتياطية
mkdir -p "$BACKUP_DIR"

# قراءة تقرير الأدلة
echo -e "${YELLOW}📖 قراءة تقرير الأدلة...${NC}"

# تحليل الملفات المراد حذفها
files_to_remove=()
files_to_review=()
total_size=0

while IFS= read -r line; do
    if [ -n "$line" ]; then
        path=$(echo "$line" | jq -r '.path')
        decision=$(echo "$line" | jq -r '.decision')
        size=$(echo "$line" | jq -r '.size_bytes')
        
        if [ "$decision" = "remove" ]; then
            files_to_remove+=("$path")
            total_size=$((total_size + size))
        elif [ "$decision" = "review" ]; then
            files_to_review+=("$path")
        fi
    fi
done < "$REPORT_FILE"

echo -e "${GREEN}✅ تم تحليل التقرير${NC}"
echo "الملفات المراد حذفها: ${#files_to_remove[@]}"
echo "الملفات المراجعة: ${#files_to_review[@]}"
echo "إجمالي الحجم: $((total_size / 1024)) KB"

# عرض الملفات المراد حذفها
if [ ${#files_to_remove[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}📋 الملفات المراد حذفها:${NC}"
    for file in "${files_to_remove[@]}"; do
        echo "  - $file"
    done
fi

# عرض الملفات المراجعة
if [ ${#files_to_review[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  الملفات المراجعة (لن يتم حذفها):${NC}"
    for file in "${files_to_review[@]}"; do
        echo "  - $file"
    done
fi

# التحقق من Dry Run
if [ "$DRY_RUN" = "--dry-run" ]; then
    echo -e "\n${YELLOW}🔍 وضع Dry Run - لن يتم حذف أي ملفات${NC}"
    echo "لتنفيذ الحذف الفعلي، استخدم: $0 --execute"
    exit 0
fi

# التحقق من التنفيذ الفعلي
if [ "$DRY_RUN" != "--execute" ]; then
    echo -e "\n${RED}❌ خطأ: يجب استخدام --execute لتنفيذ الحذف الفعلي${NC}"
    exit 1
fi

# تأكيد من المستخدم
echo -e "\n${RED}⚠️  تحذير: سيتم حذف ${#files_to_remove[@]} ملف نهائياً!${NC}"
read -p "هل أنت متأكد؟ اكتب 'yes' للمتابعة: " confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${YELLOW}❌ تم إلغاء العملية${NC}"
    exit 0
fi

# إنشاء نسخة احتياطية
echo -e "\n${YELLOW}💾 إنشاء نسخة احتياطية...${NC}"
for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        # إنشاء مجلد الوجهة
        dir=$(dirname "$BACKUP_DIR/$file")
        mkdir -p "$dir"
        
        # نسخ الملف
        cp "$file" "$BACKUP_DIR/$file"
        echo "  ✓ تم نسخ $file"
    fi
done

# حذف الملفات
echo -e "\n${YELLOW}🗑️  حذف الملفات...${NC}"
deleted_count=0
for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ تم حذف $file"
        deleted_count=$((deleted_count + 1))
    else
        echo "  ⚠️  الملف غير موجود: $file"
    fi
done

# تحديث Git
echo -e "\n${YELLOW}📝 تحديث Git...${NC}"
git add -A
git commit -m "chore(cleanup): remove $deleted_count unused files

- تم حذف $deleted_count ملف غير مستخدم
- تم إنشاء نسخة احتياطية في $BACKUP_DIR
- إجمالي الحجم المحذوف: $((total_size / 1024)) KB

ملفات تم حذفها:
$(printf '%s\n' "${files_to_remove[@]}" | head -10)
$([ ${#files_to_remove[@]} -gt 10 ] && echo "... و $(( ${#files_to_remove[@]} - 10 )) ملف آخر")"

echo -e "\n${GREEN}✅ تم إنجاز عملية التنظيف بنجاح!${NC}"
echo "الملفات المحذوفة: $deleted_count"
echo "النسخة الاحتياطية: $BACKUP_DIR"
echo "لتحديث .gitignore، أضف: cleanup/_backup/"
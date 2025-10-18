#!/bin/bash

echo "🚀 بدء سيناريو الاختبار الكامل..."
echo ""

# 1. التحضير
echo "📦 تثبيت الاعتماديات..."
pnpm install --silent 2>&1 | grep -v "deprecated\|WARN" | head -5 || true

# 2. تشغيل الخدمات
echo "🔌 تشغيل جميع الخدمات في الخلفية..."
pnpm run dev:all > logs/dev-all.log 2>&1 &
DEV_PID=$!
echo "   PID: $DEV_PID"

# 3. الانتظار
echo "⏳ انتظار بدء الخدمات (60 ثانية)..."
for i in {1..60}; do
  sleep 1
  printf "."
  if [ $((i % 10)) -eq 0 ]; then
    printf " ${i}s\n   "
  fi
done
echo ""

# 4. استخراج التوقيعات
echo "🔖 استخراج توقيعات الصفحات..."
node tools/derive-page-signatures.mjs 2>&1 | grep -E "✅|❌|💾" || true

# 5. فحص الصحة
echo ""
echo "🏥 تشغيل فحص الصحة..."
node tools/advanced-health-check.mjs
HEALTH_EXIT=$?

# 6. Playwright E2E
echo ""
echo "🎭 تشغيل اختبارات Playwright..."
echo "   (قد يستغرق هذا عدة دقائق...)"
npx playwright test --reporter=list 2>&1 | head -50
PLAYWRIGHT_EXIT=$?

# 7. تجميع النتائج
echo ""
echo "📊 تجميع النتائج..."
node tools/summarize-results.mjs

# 8. التنظيف
echo ""
echo "🧹 إيقاف الخدمات..."
kill $DEV_PID 2>/dev/null || true
sleep 2

# 9. النتيجة
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $HEALTH_EXIT -eq 0 ] && [ $PLAYWRIGHT_EXIT -eq 0 ]; then
  echo "🎉 نجح جميع الاختبارات!"
  echo "📄 راجع التقرير الكامل: reports/postfix-verification.md"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "❌ فشل بعض الاختبارات!"
  echo "📄 راجع التفاصيل في:"
  echo "   - reports/health-summary.json"
  echo "   - reports/playwright-results.json"
  echo "   - playwright-report/"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi

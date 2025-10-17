# سكربت PowerShell لحذف الملفات غير المستخدمة
# Arabic Screenplay Editor - Cleanup Script
#
# تشغيل آمن: .\delete_unused.ps1 -DryRun
# تنفيذ فعلي: .\delete_unused.ps1 -Confirm

param(
    [switch]$DryRun = $true,
    [switch]$Confirm = $false
)

# ألوان للعرض
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Cyan"

Write-Host "=======================================" -ForegroundColor $Blue
Write-Host "Arabic Screenplay Editor - Cleanup Script" -ForegroundColor $Blue
Write-Host "=======================================" -ForegroundColor $Blue

# مسار المشروع
$ProjectRoot = "H:\arabic-screenplay-editor"

# الملفات والمجلدات المرشحة للحذف
$DeletionTargets = @(
    @{
        Path = "$ProjectRoot\dist"
        Type = "Directory"
        Reason = "مخرجات البناء قابلة للإعادة"
        Risk = "Low"
    },
    @{
        Path = "$ProjectRoot\node_modules"
        Type = "Directory"
        Reason = "تبعيات قابلة للتثبيت مجدداً"
        Risk = "Low"
    },
    @{
        Path = "$ProjectRoot\requirements.txt"
        Type = "File"
        Reason = "متطلبات Python في مشروع Node.js"
        Risk = "Low"
    },
    @{
        Path = "$ProjectRoot\.qoderignore"
        Type = "File"
        Reason = "ملف تكوين لأداة غير واضحة"
        Risk = "Low"
    }
)

# الملفات التي تحتاج مراجعة (نقل لا حذف)
$MoveTargets = @(
    @{
        Source = "$ProjectRoot\src\agents"
        Destination = "$ProjectRoot\archive\agents-excluded"
        Reason = "مستبعد من التكوين ولا يُستخدم"
    },
    @{
        Source = "$ProjectRoot\src\config"
        Destination = "$ProjectRoot\archive\config-excluded"
        Reason = "مستبعد من التكوين ولا يُستخدم"
    },
    @{
        Source = "$ProjectRoot\scripts"
        Destination = "$ProjectRoot\archive\analysis-scripts"
        Reason = "سكربتات Python غير مرتبطة بالمشروع"
    }
)

# عرض الملخص
Write-Host "`nملخص العملية:" -ForegroundColor $Yellow
Write-Host "الملفات المرشحة للحذف: $($DeletionTargets.Count)" -ForegroundColor $Yellow
Write-Host "الملفات المرشحة للنقل: $($MoveTargets.Count)" -ForegroundColor $Yellow

if ($DryRun) {
    Write-Host "`n[وضع المعاينة - لن يتم حذف أي شيء]" -ForegroundColor $Green
} elseif ($Confirm) {
    Write-Host "`n[وضع التنفيذ - سيتم تطبيق التغييرات]" -ForegroundColor $Red
} else {
    Write-Host "`nاستخدم -Confirm لتنفيذ العملية أو -DryRun للمعاينة فقط" -ForegroundColor $Yellow
    exit
}

Write-Host "`n--- ملفات الحذف ---" -ForegroundColor $Blue

foreach ($target in $DeletionTargets) {
    $exists = Test-Path $target.Path
    $status = if ($exists) { "موجود" } else { "غير موجود" }
    $color = if ($exists) { $Red } else { $Green }

    Write-Host "[$status] $($target.Path)" -ForegroundColor $color
    Write-Host "  السبب: $($target.Reason)" -ForegroundColor $Yellow
    Write-Host "  المخاطر: $($target.Risk)" -ForegroundColor $Yellow

    if ($exists -and $Confirm -and -not $DryRun) {
        try {
            if ($target.Type -eq "Directory") {
                Remove-Item $target.Path -Recurse -Force
                Write-Host "  ✓ تم الحذف" -ForegroundColor $Green
            } else {
                Remove-Item $target.Path -Force
                Write-Host "  ✓ تم الحذف" -ForegroundColor $Green
            }
        } catch {
            Write-Host "  ✗ فشل الحذف: $($_.Exception.Message)" -ForegroundColor $Red
        }
    }
    Write-Host ""
}

Write-Host "--- ملفات النقل ---" -ForegroundColor $Blue

foreach ($target in $MoveTargets) {
    $sourceExists = Test-Path $target.Source
    $status = if ($sourceExists) { "موجود" } else { "غير موجود" }
    $color = if ($sourceExists) { $Yellow } else { $Green }

    Write-Host "[$status] $($target.Source)" -ForegroundColor $color
    Write-Host "  إلى: $($target.Destination)" -ForegroundColor $Blue
    Write-Host "  السبب: $($target.Reason)" -ForegroundColor $Yellow

    if ($sourceExists -and $Confirm -and -not $DryRun) {
        try {
            $destDir = Split-Path $target.Destination -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Move-Item $target.Source $target.Destination -Force
            Write-Host "  ✓ تم النقل" -ForegroundColor $Green
        } catch {
            Write-Host "  ✗ فشل النقل: $($_.Exception.Message)" -ForegroundColor $Red
        }
    }
    Write-Host ""
}

# إحصائيات نهائية
$totalItems = $DeletionTargets.Count + $MoveTargets.Count
Write-Host "=======================================" -ForegroundColor $Blue
Write-Host "إجمالي العناصر المعالجة: $totalItems" -ForegroundColor $Yellow

if ($DryRun) {
    Write-Host "لتنفيذ العملية فعلياً، استخدم: .\delete_unused.ps1 -Confirm" -ForegroundColor $Green
} elseif ($Confirm) {
    Write-Host "تمت العملية بنجاح!" -ForegroundColor $Green
    Write-Host "لا تنس تشغيل 'npm install' لإعادة تثبيت التبعيات" -ForegroundColor $Yellow
}

Write-Host "=======================================" -ForegroundColor $Blue
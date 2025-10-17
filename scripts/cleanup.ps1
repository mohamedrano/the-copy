# Arabic Screenplay Editor - Project Cleanup Script
# This script removes unnecessary files and reorganizes the project structure

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "Arabic Screenplay Editor - Project Cleanup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
}

# Files and directories to remove
$itemsToRemove = @(
    @{
        Path = "analysis"
        Reason = "Temporary analysis files"
        Type = "Directory"
    },
    @{
        Path = "patches"
        Reason = "Old patch files"
        Type = "Directory"
    },
    @{
        Path = ".claude"
        Reason = "External tool configuration"
        Type = "Directory"
    },
    @{
        Path = ".kilocode"
        Reason = "External tool configuration"
        Type = "Directory"
    },
    @{
        Path = ".qodo"
        Reason = "External tool configuration"
        Type = "Directory"
    },
    @{
        Path = "الحصار الأول .. بين الركن و المقام_.docx"
        Reason = "Word document not needed in source"
        Type = "File"
    },
    @{
        Path = "الرسالة الأولى .. ست بنات.docx"
        Reason = "Word document not needed in source"
        Type = "File"
    },
    @{
        Path = ".kilocodemodes"
        Reason = "External tool configuration"
        Type = "File"
    },
    @{
        Path = ".qoderignore"
        Reason = "External tool configuration"
        Type = "File"
    },
    @{
        Path = "requirements.txt"
        Reason = "Python requirements not needed"
        Type = "File"
    }
)

# Items to move to archive
$itemsToArchive = @(
    @{
        Source = "src\components\legacy"
        Destination = "archive\components-legacy"
        Reason = "Legacy components should be archived"
    }
)

Write-Host "`nItems to be removed:" -ForegroundColor Cyan
foreach ($item in $itemsToRemove) {
    $exists = if ($item.Type -eq "Directory") { Test-Path $item.Path -PathType Container } else { Test-Path $item.Path -PathType Leaf }
    $status = if ($exists) { "EXISTS" } else { "NOT FOUND" }
    $color = if ($exists) { "White" } else { "Gray" }
    
    Write-Host "  [$status] $($item.Type): $($item.Path)" -ForegroundColor $color
    Write-Host "    Reason: $($item.Reason)" -ForegroundColor Gray
}

Write-Host "`nItems to be archived:" -ForegroundColor Cyan
foreach ($item in $itemsToArchive) {
    $exists = Test-Path $item.Source
    $status = if ($exists) { "EXISTS" } else { "NOT FOUND" }
    $color = if ($exists) { "White" } else { "Gray" }
    
    Write-Host "  [$status] $($item.Source) -> $($item.Destination)" -ForegroundColor $color
    Write-Host "    Reason: $($item.Reason)" -ForegroundColor Gray
}

if ($DryRun) {
    Write-Host "`nDry run completed. Use -Force to execute actual cleanup." -ForegroundColor Yellow
    exit 0
}

if (-not $Force) {
    $confirmation = Read-Host "`nDo you want to proceed with cleanup? (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`nStarting cleanup..." -ForegroundColor Green

# Create archive directory if it doesn't exist
if (-not (Test-Path "archive")) {
    New-Item -ItemType Directory -Path "archive" -Force | Out-Null
    Write-Host "Created archive directory" -ForegroundColor Green
}

# Archive items
foreach ($item in $itemsToArchive) {
    if (Test-Path $item.Source) {
        try {
            $destinationDir = Split-Path $item.Destination -Parent
            if (-not (Test-Path $destinationDir)) {
                New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
            }
            
            Move-Item -Path $item.Source -Destination $item.Destination -Force
            Write-Host "✓ Archived: $($item.Source) -> $($item.Destination)" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to archive: $($item.Source) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Remove items
$removedCount = 0
$failedCount = 0

foreach ($item in $itemsToRemove) {
    if (Test-Path $item.Path) {
        try {
            if ($item.Type -eq "Directory") {
                Remove-Item -Path $item.Path -Recurse -Force
            } else {
                Remove-Item -Path $item.Path -Force
            }
            Write-Host "✓ Removed: $($item.Path)" -ForegroundColor Green
            $removedCount++
        }
        catch {
            Write-Host "✗ Failed to remove: $($item.Path) - $($_.Exception.Message)" -ForegroundColor Red
            $failedCount++
        }
    }
}

Write-Host "`nCleanup Summary:" -ForegroundColor Cyan
Write-Host "  Items removed: $removedCount" -ForegroundColor Green
Write-Host "  Items failed: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
Write-Host "  Items archived: $($itemsToArchive.Count)" -ForegroundColor Green

if ($failedCount -eq 0) {
    Write-Host "`nCleanup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`nCleanup completed with errors. Check failed items above." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Run 'npm ci' to install dependencies" -ForegroundColor White
Write-Host "  2. Run 'npm run type-check' to verify TypeScript" -ForegroundColor White
Write-Host "  3. Run 'npm test' to run tests" -ForegroundColor White
Write-Host "  4. Run 'npm run build' to build for production" -ForegroundColor White
Param(
  [string]$Drama = "K:\المشروع\the copy Drama-analyst",
  [string]$Stations = "K:\المشروع\the copy stations",
  [string]$Multi = "K:\المشروع\the-copy-Multi-agent-Story"
)
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting external projects import..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path external\drama-analyst | Out-Null
New-Item -ItemType Directory -Force -Path external\stations | Out-Null
New-Item -ItemType Directory -Force -Path external\multi-agent-story | Out-Null

Write-Host "📁 Created external directories" -ForegroundColor Green

# Copy Drama Analyst
Write-Host "📦 Importing Drama Analyst..." -ForegroundColor Yellow
robocopy "$Drama" ".\external\drama-analyst" /MIR /XD node_modules .git .next dist coverage /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -gt 7) { throw "Drama Analyst copy failed" }

# Copy Stations
Write-Host "📦 Importing Stations..." -ForegroundColor Yellow
robocopy "$Stations" ".\external\stations" /MIR /XD node_modules .git .next dist coverage /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -gt 7) { throw "Stations copy failed" }

# Copy Multi-Agent Story
Write-Host "📦 Importing Multi-Agent Story..." -ForegroundColor Yellow
robocopy "$Multi" ".\external\multi-agent-story" /MIR /XD node_modules .git .next dist coverage /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -gt 7) { throw "Multi-Agent Story copy failed" }

Write-Host "`n✅ Successfully imported all external sources!" -ForegroundColor Green
Write-Host "   - external/drama-analyst/" -ForegroundColor Gray
Write-Host "   - external/stations/" -ForegroundColor Gray
Write-Host "   - external/multi-agent-story/" -ForegroundColor Gray

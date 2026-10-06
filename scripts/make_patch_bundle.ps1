# Script to generate a lightweight OTA Patch Bundle (omni_patch.zip) for remote clients
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PatchZip = Join-Path $ProjectRoot "omni_patch.zip"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  OMNIBACKUP ENTERPRISE - OTA PATCH BUNDLER (v2.6.0)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Ensure Client Production Build is fresh
Write-Host "[1/3] React Client derleniyor (npm run build)..." -ForegroundColor Yellow
npm --prefix "$ProjectRoot\client" run build

# 2. Compile OmniUpdater.exe if needed
Write-Host "[2/3] Native OmniUpdater.exe kontrol ediliyor..." -ForegroundColor Yellow
$UpdaterCs = Join-Path $ProjectRoot "scripts\OmniUpdater.cs"
$UpdaterExe = Join-Path $ProjectRoot "scripts\OmniUpdater.exe"
& C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:"$UpdaterExe" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll /optimize+ "$UpdaterCs"

# 3. Create lightweight omni_patch.zip (Excludes db.json, storage, backups, node_modules)
Write-Host "[3/3] Hafif Ag Guncelleme Paketi olusturuluyor (omni_patch.zip)..." -ForegroundColor Yellow
if (Test-Path $PatchZip) { Remove-Item -Force $PatchZip }

Set-Location $ProjectRoot

# Pack core updated files: server (excluding node_modules, db.json and storage), client/dist, scripts, version.json
& tar.exe -acf omni_patch.zip --exclude=server/node_modules --exclude=server/db.json --exclude=server/storage --exclude=server/data --exclude=client/src --exclude=client/node_modules --exclude=omni_payload.zip --exclude=omni_patch.zip --exclude=.git server client/dist scripts/OmniUpdater.exe version.json

if (Test-Path $PatchZip) {
    $Item = Get-Item $PatchZip
    $SizeMB = [math]::Round($Item.Length / 1MB, 2)
    Write-Host ""
    Write-Host "[OK] BASARILI: omni_patch.zip olusturuldu!" -ForegroundColor Green
    Write-Host "Boyut: $SizeMB MB (Network OTA Guncelleme Icin Hazir)" -ForegroundColor White
    Write-Host "Yol  : $PatchZip" -ForegroundColor White
} else {
    Write-Host "[HATA] omni_patch.zip olusturulamadi!" -ForegroundColor Red
}

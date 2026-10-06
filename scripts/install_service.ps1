# OmniBackup Enterprise - Windows Service Registration Script
# Run as Administrator

$ServiceName = "OmniBackupCoreSvc"
$DisplayName = "OmniBackup Enterprise Core Service"
$NodeExe = (Get-Command node).Source
$ScriptDir = Split-Path -Parent $PSScriptRoot
$ServerIndex = Join-Path $ScriptDir "server\index.js"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  OMNIBACKUP ENTERPRISE - WINDOWS SERVICE INSTALL" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check Administrator privileges
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "[HATA] Lütfen bu scripti 'Yönetici Olarak Çalıştır' seçeneği ile başlatın!" -ForegroundColor Red
    exit 1
}

# Stop and remove existing service if present
$Existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($Existing) {
    Write-Host "[*] Mevcut servis durduruluyor ve siliniyor..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    & sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

# Create Windows Service with auto-start
Write-Host "[*] Windows NT Servisi oluşturuluyor ($ServiceName)..." -ForegroundColor Yellow
$BinPath = "`"$NodeExe`" `"$ServerIndex`""
$CreateResult = & sc.exe create $ServiceName binPath= $BinPath start= auto DisplayName= $DisplayName

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Servis başarıyla oluşturuldu." -ForegroundColor Green
    & sc.exe description $ServiceName "OmniBackup 7/24 Kesintisiz Arka Plan Yedekleme ve Felaket Kurtarma Servisi"
    Write-Host "[*] Servis başlatılıyor..." -ForegroundColor Yellow
    & sc.exe start $ServiceName
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "  OMNIBACKUP WINDOWS SERVİSİ 7/24 ARTIK AKTİF!" -ForegroundColor Green
    Write-Host "  Windows oturumu kapansa bile görevler çalışacak." -ForegroundColor White
    Write-Host "=================================================" -ForegroundColor Green
} else {
    Write-Host "[HATA] Servis oluşturulamadı! Kod: $LASTEXITCODE" -ForegroundColor Red
}

# ==============================================================================
# OmniBackup Enterprise - Master Server Windows Service Installer
# Author: Onder Cihan ACAR
# ==============================================================================
[CmdletBinding()]
param (
    [string]$ServiceName = "OmniBackupMaster",
    [string]$DisplayName = "OmniBackup Enterprise Master Server",
    [string]$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source,
    [string]$AppRoot = (Split-Path -Parent $PSScriptRoot)
)

Write-Host "=================================================================" -ForegroundColor Green
Write-Host " OmniBackup Enterprise - Windows Servis Kurulum Sihirbazi        " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Green

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Bu scripti YONETICI (Administrator) yetkileriyle calistirmalisiniz!"
    exit 1
}

$ServerJsPath = Join-Path $AppRoot "server\index.js"
Write-Host "Uygulama Dizini: $ServerJsPath" -ForegroundColor Yellow

# Use PowerShell / Windows Native SC or NSSM wrapper
$binPath = "`"$NodePath`" `"$ServerJsPath`""

try {
    # Check if service already exists
    $existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Mevcut servis durduruluyor ve kaldiriliyor..." -ForegroundColor Yellow
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        & sc.exe delete $ServiceName | Out-Null
        Start-Sleep -Seconds 2
    }

    Write-Host "Yeni Windows Servisi olusturuluyor: $DisplayName" -ForegroundColor Cyan
    & sc.exe create $ServiceName binPath= $binPath start= auto DisplayName= $DisplayName
    & sc.exe description $ServiceName "OmniBackup Merkezi Kurumsal Yedekleme ve SQL Yonetim Motoru."

    Write-Host "Servis baslatiliyor..." -ForegroundColor Green
    Start-Service -Name $ServiceName

    Write-Host "TEBRIKLER! OmniBackup Windows Servisi basariyla kuruldu ve calisiyor." -ForegroundColor Green
    Write-Host "Durum: $((Get-Service -Name $ServiceName).Status)" -ForegroundColor Cyan
} catch {
    Write-Host "Servis kurulum hatasi: $($_.Exception.Message)" -ForegroundColor Red
}

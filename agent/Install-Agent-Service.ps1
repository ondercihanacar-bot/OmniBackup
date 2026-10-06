# ==============================================================================
# OmniBackup Enterprise - Windows Remote Agent Service Installer
# Author: Onder Cihan ACAR
# ==============================================================================
[CmdletBinding()]
param (
    [string]$ServerUrl = "http://127.0.0.1:3060",
    [string]$ServiceName = "OmniBackupAgent",
    [string]$DisplayName = "OmniBackup Enterprise Remote Agent"
)

Write-Host "=================================================================" -ForegroundColor Green
Write-Host " OmniBackup Enterprise - Ajan Windows Servis Kurulumu            " -ForegroundColor Cyan
Write-Host " Master Sunucu: $ServerUrl                                       " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Bu scripti YONETICI (Administrator) yetkileriyle calistirmalisiniz!"
    exit 1
}

$AgentScriptPath = Join-Path $PSScriptRoot "OmniBackup-Agent.ps1"
$psExe = (Get-Command powershell.exe).Source
$binPath = "`"$psExe`" -ExecutionPolicy Bypass -NoProfile -File `"$AgentScriptPath`" -ServerUrl `"$ServerUrl`""

try {
    $existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existing) {
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        & sc.exe delete $ServiceName | Out-Null
        Start-Sleep -Seconds 2
    }

    Write-Host "Windows Servisi olusturuluyor ($ServiceName)..." -ForegroundColor Cyan
    & sc.exe create $ServiceName binPath= $binPath start= auto DisplayName= $DisplayName
    & sc.exe description $ServiceName "OmniBackup Master Sunucusu ile iletisim kuran VSS ve dosya yedekleme ajani."

    Start-Service -Name $ServiceName
    Write-Host "Ajan Windows Servisi basariyla kuruldu ve arka planda calisiyor!" -ForegroundColor Green
} catch {
    Write-Host "Servis olusturulamadi: $($_.Exception.Message)" -ForegroundColor Red
}

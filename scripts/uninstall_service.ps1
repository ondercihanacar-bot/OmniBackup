# OmniBackup Enterprise - Windows Service Removal Script
# Run as Administrator

$ServiceName = "OmniBackupCoreSvc"

Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "  OMNIBACKUP ENTERPRISE - WINDOWS SERVICE REMOVAL" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow

$Existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($Existing) {
    Write-Host "[*] Servis durduruluyor..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "[*] Servis kaydı siliniyor..." -ForegroundColor Yellow
    & sc.exe delete $ServiceName
    Write-Host "[OK] OmniBackup Windows Servisi başarıyla kaldırıldı." -ForegroundColor Green
} else {
    Write-Host "[BİLGİ] $ServiceName zaten kurulu değil." -ForegroundColor White
}

@echo off
chcp 65001 >nul
echo [OMNIBACKUP] Arka plan servisi durduruluyor...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3060" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo [OMNIBACKUP] OmniBackup başarıyla durduruldu.
timeout /t 2 >nul

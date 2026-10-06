@echo off
chcp 65001 >nul
title OmniBackup Enterprise - Masaüstü Kurulum ve Başlatıcı
color 0B

echo ===============================================================================
echo                OMNIBACKUP ENTERPRISE CYBER VAULT KURULUMU
echo ===============================================================================
echo.
echo [1/4] Node.js Çalışma Ortamı Kontrol Ediliyor...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js sisteminizde kurulu bulunamadı!
    echo OmniBackup'ın çalışması için lütfen https://nodejs.org adresinden LTS sürümünü kurunuz.
    echo.
    pause
    exit /b 1
)
echo [✓] Node.js Tespit Edildi.

echo.
echo [2/4] Masaüstü Uygulama Motoru Hazırlanıyor...
if exist "scripts\OmniBackup.exe" (
    copy /y "scripts\OmniBackup.exe" "OmniBackup.exe" >nul
)
echo [✓] OmniBackup Masaüstü Uygulaması Hazır.

echo.
echo [3/4] Masaüstü Kısayolu Oluşturuluyor...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\create_desktop_shortcut.ps1"

echo.
echo [4/4] OmniBackup Enterprise Masaüstü Uygulaması Başlatılıyor...
if exist "OmniBackup.exe" (
    start "" "%~dp0OmniBackup.exe"
) else (
    start "" wscript.exe "%~dp0scripts\launcher.vbs"
)

echo.
echo ===============================================================================
echo [BAŞARILI] OmniBackup masaüstü programı olarak açıldı!
echo ===============================================================================
echo.
timeout /t 3 >nul

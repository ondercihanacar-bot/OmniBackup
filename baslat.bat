@echo off
chcp 65001 >nul
title OmniBackup Enterprise - Masaüstü Uygulaması
cd /d "%~dp0"
cls

echo ======================================================================
echo           OMNIBACKUP ENTERPRISE MASAÜSTÜ UYGULAMASI
echo ======================================================================
echo.
echo [*] OmniBackup Enterprise başlatılıyor...
echo.

if exist "OmniBackup.exe" (
    start "" "OmniBackup.exe"
    exit /b 0
)

if exist "scripts\OmniBackup.exe" (
    start "" "scripts\OmniBackup.exe"
    exit /b 0
)

start "" wscript.exe "%~dp0scripts\launcher.vbs"
exit /b 0

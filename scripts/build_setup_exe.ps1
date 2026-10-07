# Build Standalone OmniBackup_Setup.exe Installer with Embedded Assets, UAC Manifest & Full Offline Payload
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$PayloadZip = Join-Path $ProjectRoot "omni_payload.zip"
$OutputFile = Join-Path $DesktopPath "OmniBackup_Setup.exe"
$IconPath = Join-Path $ProjectRoot "scripts\app.ico"
$LogoPath = Join-Path $ProjectRoot "scripts\app_logo.png"
$ManifestPath = Join-Path $ProjectRoot "scripts\app.manifest"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  OMNIBACKUP ENTERPRISE - NATIVE SETUP COMPILER (v2.5)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Step 1: Ensure Icons & Native App Launcher exist
if (-not (Test-Path $IconPath) -or -not (Test-Path $LogoPath)) {
    Write-Host "[*] Ikonlar olusturuluyor..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    & C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:exe /out:scripts\MakeIcon.exe /reference:System.Drawing.dll scripts\MakeIcon.cs
    & .\scripts\MakeIcon.exe (Join-Path $ProjectRoot "scripts")
}

Write-Host "[*] Native OmniBackup.exe launcher derleniyor..." -ForegroundColor Yellow
$LauncherCs = Join-Path $ProjectRoot "scripts\AppLauncher.cs"
$LauncherOut = Join-Path $ProjectRoot "scripts\OmniBackup.exe"
$RootLauncherOut = Join-Path $ProjectRoot "OmniBackup.exe"

& C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:"$LauncherOut" /win32icon:"$IconPath" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /optimize+ "$LauncherCs"
Copy-Item -Force "$LauncherOut" "$RootLauncherOut"

Write-Host "[*] Native Uninstall.exe temizleyici derleniyor..." -ForegroundColor Yellow
$UninstallerCs = Join-Path $ProjectRoot "scripts\Uninstaller.cs"
$UninstallerOut = Join-Path $ProjectRoot "scripts\Uninstall.exe"
$RootUninstallerOut = Join-Path $ProjectRoot "Uninstall.exe"
& C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:"$UninstallerOut" /win32icon:"$IconPath" /win32manifest:"$ManifestPath" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /optimize+ "$UninstallerCs"
Copy-Item -Force "$UninstallerOut" "$RootUninstallerOut"

# Step 2: Ensure Client Production Build is Up-To-Date
$ClientDist = Join-Path $ProjectRoot "client\dist"
if (-not (Test-Path $ClientDist)) {
    Write-Host "[*] Client production build derleniyor..." -ForegroundColor Yellow
    npm --prefix "$ProjectRoot\client" run build
}

# Step 3: Create Complete Offline Zip Payload
Write-Host "[1/3] Tam cevrimdisi payload arsivi olusturuluyor (omni_payload.zip)..." -ForegroundColor Yellow
if (Test-Path $PayloadZip) { Remove-Item -Force $PayloadZip }

Set-Location $ProjectRoot
& tar.exe -acf omni_payload.zip --exclude=client/src --exclude=client/node_modules --exclude=server/data --exclude=omni_payload.zip --exclude=.git server client/dist scripts logo OmniBackup.exe Uninstall.exe KURULUM_KILAVUZU.txt package.json app.ico app_logo.png Microsoft.Web.WebView2.Core.dll Microsoft.Web.WebView2.WinForms.dll WebView2Loader.dll node.exe version.json

if (-not (Test-Path $PayloadZip)) {
    Write-Host "[HATA] omni_payload.zip olusturulamadi!" -ForegroundColor Red
    exit 1
}

$PayloadItem = Get-Item $PayloadZip
$SizeMB = [math]::Round($PayloadItem.Length / 1MB, 2)
Write-Host "[OK] omni_payload.zip hazir (Tum node_modules & dist dahil): $SizeMB MB" -ForegroundColor Green

# Step 4: Compile C# Installer into Native .EXE with Embedded Manifest, Icon & Payload
Write-Host "[2/3] Kurulum Sihirbazi ve UAC Manifest derleniyor (csc.exe)..." -ForegroundColor Yellow

$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$InstallerCs = Join-Path $ProjectRoot "scripts\Installer.cs"

$CscArgs = @(
    "/target:winexe",
    "/out:`"$OutputFile`"",
    "/win32icon:`"$IconPath`"",
    "/win32manifest:`"$ManifestPath`"",
    "/resource:`"$PayloadZip`",omni_payload.zip",
    "/reference:System.Windows.Forms.dll",
    "/reference:System.Drawing.dll",
    "/reference:System.IO.Compression.dll",
    "/reference:System.IO.Compression.FileSystem.dll",
    "/reference:Microsoft.CSharp.dll",
    "/optimize+",
    "`"$InstallerCs`""
)

$Process = Start-Process -FilePath $CscPath -ArgumentList $CscArgs -Wait -NoNewWindow -PassThru

if ($Process.ExitCode -ne 0) {
    Write-Host "[HATA] Derleme basarisiz oldu! Kod: $($Process.ExitCode)" -ForegroundColor Red
    exit 1
}

# Step 5: Verify Output & Copy to Root for GitHub Release
if (Test-Path $OutputFile) {
    $RootSetupOut = Join-Path $ProjectRoot "OmniBackup_Setup.exe"
    Copy-Item -Force "$OutputFile" "$RootSetupOut"

    $ExeItem = Get-Item $OutputFile
    $ExeSizeMB = [math]::Round($ExeItem.Length / 1MB, 2)
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Green
    Write-Host "[OK] BASARILI: Standalone Kurulum Setup Dosyasi Olusturuldu!" -ForegroundColor Green
    Write-Host "Masaustu Yolu : $OutputFile" -ForegroundColor White
    Write-Host "Repo Koku     : $RootSetupOut" -ForegroundColor White
    Write-Host "Dosya Boyutu  : $ExeSizeMB MB (Tam Offline Kurulum)" -ForegroundColor White
    Write-Host "Uygulama Ikonu: $IconPath (Gomuldu)" -ForegroundColor White
    Write-Host "UAC Manifest  : requireAdministrator (Gomuldu)" -ForegroundColor White
    Write-Host "=======================================================" -ForegroundColor Green
} else {
    Write-Host "[HATA] Setup .exe olusturulamadi!" -ForegroundColor Red
}

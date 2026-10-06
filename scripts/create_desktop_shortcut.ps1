# Create Desktop Shortcut for OmniBackup Desktop Application
$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ProjectRoot = Split-Path -Parent $PSScriptRoot

$ExePath = Join-Path $ProjectRoot "OmniBackup.exe"
if (-not (Test-Path $ExePath)) {
    $ExePath = Join-Path $ProjectRoot "scripts\OmniBackup.exe"
}

$IconPath = Join-Path $ProjectRoot "scripts\app.ico"
if (-not (Test-Path $IconPath)) {
    $IconPath = Join-Path $ProjectRoot "app.ico"
}

$ShortcutPath = Join-Path $DesktopPath "OmniBackup Cyber Vault.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

if (Test-Path $ExePath) {
    $Shortcut.TargetPath = $ExePath
    $Shortcut.Arguments = ""
} else {
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$ProjectRoot\scripts\launcher.vbs`""
}

$Shortcut.WorkingDirectory = $ProjectRoot
$Shortcut.Description = "OmniBackup Enterprise Cyber Vault Masaüstü Uygulaması"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath, 0"
}
$Shortcut.Save()

Write-Host "[OK] Desktop Shortcut Created: $ShortcutPath" -ForegroundColor Green

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath('Desktop')

$Shortcuts = @(
    (Join-Path $DesktopPath "OmniBackup.lnk"),
    (Join-Path $DesktopPath "OmniBackup Enterprise.lnk")
)

$TargetExe = "C:\OmniBackup\OmniBackup.exe"
$WorkingDir = "C:\OmniBackup"
$IconFile = "C:\OmniBackup\app.ico"

if (-not (Test-Path $TargetExe)) {
    $TargetExe = Join-Path (Split-Path -Parent $PSScriptRoot) "OmniBackup.exe"
    $WorkingDir = Split-Path -Parent $PSScriptRoot
    $IconFile = Join-Path (Split-Path -Parent $PSScriptRoot) "scripts\app.ico"
}

foreach ($ShortcutPath in $Shortcuts) {
    try {
        $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
        $Shortcut.TargetPath = $TargetExe
        $Shortcut.WorkingDirectory = $WorkingDir
        $Shortcut.Description = "OmniBackup Enterprise Cyber Vault - Kurumsal Veri Koruma ve Yedekleme Platformu"
        if (Test-Path $IconFile) {
            $Shortcut.IconLocation = "$IconFile,0"
        } else {
            $Shortcut.IconLocation = "$TargetExe,0"
        }
        $Shortcut.Save()
        Write-Host "[OK] Kisayol basariyla olusturuldu/guncellendi: $ShortcutPath" -ForegroundColor Green
        Write-Host "     Hedef: $TargetExe" -ForegroundColor Cyan
        Write-Host "     Calisma Dizini: $WorkingDir" -ForegroundColor Cyan
    } catch {
        Write-Host "[HATA] Kisayol olusturulamadi: $_" -ForegroundColor Red
    }
}

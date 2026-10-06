$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$StartupPath = [System.Environment]::GetFolderPath('Startup')
$WorkingDir = "C:\Users\Onder\Desktop\OmniBackup"
$TargetExe = "$WorkingDir\OmniBackup.exe"
$IconPath = "$WorkingDir\app.ico"

# 1. Create Desktop Shortcut
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\OmniBackup Enterprise.lnk")
if (Test-Path $TargetExe) {
    $Shortcut.TargetPath = $TargetExe
    $Shortcut.Arguments = ""
} else {
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$WorkingDir\launcher.vbs`""
}
$Shortcut.WorkingDirectory = $WorkingDir
$Shortcut.WindowStyle = 1
$Shortcut.Description = "OmniBackup Enterprise Cyber Vault Masaüstü Uygulaması"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath, 0"
}
$Shortcut.Save()
Write-Host "Desktop shortcut created at: $DesktopPath\OmniBackup Enterprise.lnk"

# 2. Create Windows Startup Shortcut (Automatic boot runner)
$StartupShortcut = $WshShell.CreateShortcut("$StartupPath\OmniBackup Master Service.lnk")
if (Test-Path $TargetExe) {
    $StartupShortcut.TargetPath = $TargetExe
    $StartupShortcut.Arguments = ""
} else {
    $StartupShortcut.TargetPath = "wscript.exe"
    $StartupShortcut.Arguments = "`"$WorkingDir\launcher.vbs`""
}
$StartupShortcut.WorkingDirectory = $WorkingDir
$StartupShortcut.WindowStyle = 7
$StartupShortcut.Description = "OmniBackup Master Background Service"
if (Test-Path $IconPath) {
    $StartupShortcut.IconLocation = "$IconPath, 0"
}
$StartupShortcut.Save()
Write-Host "Startup shortcut created at: $StartupPath\OmniBackup Master Service.lnk"

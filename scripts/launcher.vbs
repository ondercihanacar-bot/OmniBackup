Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

ScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ProjectRoot = fso.GetParentFolderName(ScriptDir)
WshShell.CurrentDirectory = ProjectRoot

' 1. Check if native OmniBackup.exe exists
ExePath = ProjectRoot & "\OmniBackup.exe"
If fso.FileExists(ExePath) Then
    WshShell.Run """" & ExePath & """", 1, False
    WScript.Quit
End If

ExeScriptPath = ScriptDir & "\OmniBackup.exe"
If fso.FileExists(ExeScriptPath) Then
    WshShell.Run """" & ExeScriptPath & """", 1, False
    WScript.Quit
End If

' 2. Fallback: Run node server in background
WshShell.Run "cmd /c node server/index.js", 0, False
WScript.Sleep 1500

' 3. Open in Dedicated Desktop App Window (Edge / Chrome)
EdgePath1 = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
EdgePath2 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
ProfileDir = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\OmniBackup\DesktopProfile")

If fso.FileExists(EdgePath1) Then
    WshShell.Run """" & EdgePath1 & """ --app=http://localhost:3060 --user-data-dir=""" & ProfileDir & """ --window-size=1440,900", 1, False
ElseIf fso.FileExists(EdgePath2) Then
    WshShell.Run """" & EdgePath2 & """ --app=http://localhost:3060 --user-data-dir=""" & ProfileDir & """ --window-size=1440,900", 1, False
ElseIf fso.FileExists(ChromePath) Then
    WshShell.Run """" & ChromePath & """ --app=http://localhost:3060 --user-data-dir=""" & ProfileDir & """ --window-size=1440,900", 1, False
Else
    WshShell.Run "http://localhost:3060", 1, False
End If

Get-Process | Where-Object { $_.MainWindowTitle -like '*Omni*' -or $_.MainWindowTitle -like '*localhost*' } | Select-Object Id, ProcessName, MainWindowTitle

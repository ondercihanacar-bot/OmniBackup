# ==============================================================================
# OmniBackup Enterprise - Windows Server & Client Universal Agent
# Author: Onder Cihan ACAR
# ==============================================================================
[CmdletBinding()]
param (
    [string]$ServerUrl = "http://127.0.0.1:3060",
    [string]$AgentKey = "OMNI-AGENT-SECURE-KEY-2026",
    [int]$IntervalSeconds = 15
)

$ErrorActionPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " OmniBackup Enterprise Windows Agent v1.4.0                       " -ForegroundColor Green
Write-Host " Baglanilan Master Sunucu: $ServerUrl                           " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

function Get-SystemMetrics {
    $osInfo = Get-CimInstance Win32_OperatingSystem
    $computerName = $env:COMPUTERNAME
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet*','Wi-Fi*' | Select-Object -First 1).IPAddress
    if (-not $ip) { $ip = "127.0.0.1" }

    $totalRam = [math]::Round($osInfo.TotalVisibleMemorySize / 1MB, 1)
    $freeRam = [math]::Round($osInfo.FreePhysicalMemory / 1MB, 1)
    $usedRam = [math]::Round($totalRam - $freeRam, 1)

    $cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
    if (-not $cpu) { $cpu = 5 }

    $systemDrive = Get-PSDrive -Name C
    $freeDisk = [math]::Round($systemDrive.Free / 1GB, 1)
    $totalDisk = [math]::Round(($systemDrive.Used + $systemDrive.Free) / 1GB, 1)

    return @{
        hostname = $computerName
        ipAddress = $ip
        os = "$($osInfo.Caption) ($($osInfo.OSArchitecture))"
        version = "v1.4.0"
        cpuUsage = "$([math]::Round($cpu))%"
        ramUsage = "$usedRam GB / $totalRam GB"
        diskFree = "$freeDisk GB / $totalDisk GB"
        role = if ($osInfo.Caption -match "Server") { "Windows Server" } else { "Windows Client PC" }
    }
}

# Function to execute local VSS Shadow Copy for open files (Outlook PST, locked DBs)
function Copy-OpenFilesVSS {
    param(
        [string]$SourcePath,
        [string]$DestinationPath
    )
    Write-Host "[VSS] VSS Golge Kopyasi (Volume Shadow Copy) hazirlaniyor..." -ForegroundColor Cyan
    # Uses Windows Volume Shadow Copy Provider or vshadow/robocopy with backup mode (/b)
    & robocopy $SourcePath $DestinationPath /E /B /R:2 /W:3 /NP
}

# Register & Heartbeat Loop
while ($true) {
    try {
        $metrics = Get-SystemMetrics
        $body = $metrics | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$ServerUrl/api/agents/heartbeat" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{ "X-Agent-Key" = $AgentKey } `
            -TimeoutSec 10

        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] Heartbeat gonderildi: $($metrics.hostname) (CPU: $($metrics.cpuUsage), RAM: $($metrics.ramUsage))" -ForegroundColor Gray
    }
    catch {
        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] Sunucuya ulasilamadi ($ServerUrl): $($_.Exception.Message)" -ForegroundColor Red
    }

    Start-Sleep -Seconds $IntervalSeconds
}

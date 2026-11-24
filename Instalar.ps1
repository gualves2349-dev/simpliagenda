$ErrorActionPreference = 'Stop'
$paths = @("$env:ProgramFiles\AutoHotkey\v2\AutoHotkey64.exe", "$env:ProgramFiles\AutoHotkey\v2\AutoHotkey32.exe", "$env:LOCALAPPDATA\Programs\AutoHotkey\v2\AutoHotkey64.exe")
$exe = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (!$exe) { throw 'AutoHotkey v2 nao encontrado. Instale ou ajuste o caminho no script.' }
$dest = Join-Path $env:LOCALAPPDATA 'SimpliAgendaPilot'
New-Item -ItemType Directory -Force $dest | Out-Null
$script = Join-Path $dest 'SimpliAgenda.ahk'
Copy-Item (Join-Path $PSScriptRoot 'SimpliAgenda.ahk') $script -Force
$key = 'HKCU:\Software\Classes\simpliagenda'
New-Item -Path $key -Force | Out-Null
Set-Item $key -Value 'URL:SimpliAgenda Pilot'
New-ItemProperty -Path $key -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
New-Item -Path "$key\shell\open\command" -Force | Out-Null
Set-Item "$key\shell\open\command" -Value ('"{0}" "{1}" "%1"' -f $exe,$script)
Write-Host 'Protocolo instalado. Teste com o comando indicado no README.'

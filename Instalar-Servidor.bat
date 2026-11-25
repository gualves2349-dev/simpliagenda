@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -Command "$a=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File '+[char]34+'%~dp0Servidor.ps1'+[char]34); $t=New-ScheduledTaskTrigger -AtLogOn -User ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name); $s=New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries; Register-ScheduledTask -TaskName SimpliAgendaPush -Action $a -Trigger $t -Settings $s -Force -ErrorAction Stop; Start-ScheduledTask -TaskName SimpliAgendaPush"
pause

@echo off
powershell.exe -NoProfile -Command "Unregister-ScheduledTask -TaskName SimpliAgendaPush -Confirm:$false"
pause

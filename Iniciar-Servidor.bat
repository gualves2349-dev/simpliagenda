@echo off
powershell.exe -NoProfile -Command "Start-ScheduledTask -TaskName SimpliAgendaPush"
pause

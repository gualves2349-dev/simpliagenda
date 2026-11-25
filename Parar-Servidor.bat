@echo off
powershell.exe -NoProfile -Command "Stop-ScheduledTask -TaskName SimpliAgendaPush"
pause

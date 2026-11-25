$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
$env:GOOGLE_APPLICATION_CREDENTIALS='D:\simpliagenda\segredos\firebase-admin.json'
$mutex=New-Object System.Threading.Mutex($false,'Local\SimpliAgendaPush4420')
try { $owned=$mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $owned=$true }
if (!$owned) { exit 0 }
try {
 New-Item -ItemType Directory -Force logs | Out-Null
 $node=(Get-Command node.exe).Source
 while ($true) {
  $log=Join-Path $PSScriptRoot ('logs\push-'+(Get-Date -Format yyyy-MM-dd)+'.log')
  & $node server.cjs *>> $log
  Start-Sleep -Seconds 15
 }
} finally { $mutex.ReleaseMutex(); $mutex.Dispose() }

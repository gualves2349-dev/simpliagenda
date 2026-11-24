Remove-Item 'HKCU:\Software\Classes\simpliagenda' -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'Protocolo removido. Registros de tentativas preservados.'

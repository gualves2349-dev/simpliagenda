$ErrorActionPreference = 'Stop'
$cmd = (Get-Item 'HKCU:\Software\Classes\simpliagenda\shell\open\command').GetValue('')
if ($cmd -notmatch '"([^"\r\n]+\.ahk)"') { throw 'Script AHK nao localizado.' }
$arquivo = $Matches[1]
$conteudo = Get-Content -LiteralPath $arquivo -Raw
if ($conteudo -notmatch 'Sleep\(7000\)') { throw 'Sleep(7000) nao encontrado. Confira o script instalado.' }
Copy-Item -LiteralPath $arquivo -Destination ($arquivo + '.bak') -Force
Set-Content -LiteralPath $arquivo -Value ($conteudo.Replace('Sleep(7000)','Sleep(5000)')) -Encoding UTF8
Write-Host 'Tempo ajustado para 5 segundos. Backup criado.' -ForegroundColor Green

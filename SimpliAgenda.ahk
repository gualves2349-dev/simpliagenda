#Requires AutoHotkey v2.0
#SingleInstance Off
SetTitleMatchMode(2)
if A_Args.Length != 1
    ExitApp()
uri := A_Args[1]
if !RegExMatch(uri, "i)^simpliagenda://send/([a-z0-9_-]{1,150})\?text=([a-z0-9_.~%-]{1,5000})/?$", &m)
    ExitApp()
if RegExMatch(m[2], "%(?![0-9a-fA-F]{2})")
    ExitApp()
; Fixed recipient for local self-test only. Never accept a phone from the URI.
mutex := DllCall("CreateMutex", "Ptr", 0, "Int", 1, "Str", "Local\SimpliAgenda386", "Ptr")
if !mutex || A_LastError = 183
    ExitApp()
folder := A_LocalAppData "\SimpliAgendaPilot"
DirCreate(folder)
marker := folder "\" m[1] ".attempt"
if FileExist(marker) {
    TrayTip("Evento ja processado ou tentado.", "SimpliAgenda")
    ExitApp()
}
Run("whatsapp://send?phone=5547992292349&text=" m[2])
if !WinWaitActive("WhatsApp ahk_exe WhatsApp.exe", , 20) {
    TrayTip("WhatsApp Desktop nao identificado. Nenhum Enter enviado.", "SimpliAgenda")
    ExitApp()
}
hwnd := WinExist("A")
Sleep(5000)
if !WinActive("ahk_id " hwnd) || WinGetProcessName("ahk_id " hwnd) != "WhatsApp.exe"
    ExitApp()
; Record before pressing Enter to prevent repeat attempts. Not a delivery receipt.
FileAppend(A_Now, marker)
SendEvent("{Enter}")
TrayTip("Comando de envio executado. Confira a conversa.", "SimpliAgenda")
ExitApp()

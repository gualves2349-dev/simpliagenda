#Requires AutoHotkey v2.0
#SingleInstance Force
SetTitleMatchMode(2)

TrayTip("Bot automatico V3 iniciado", "SimpliAgenda")

F8::
{
    Run("whatsapp://send?phone=5547992292349&text=Teste%20automatico%20SimpliAgenda%20V3")

    if !WinWaitActive("WhatsApp", , 20)
    {
        TrayTip("Janela nao identificada", "SimpliAgenda")
        return
    }

    Sleep(5000)

    if WinActive("WhatsApp")
    {
        SendEvent("{Enter}")
        TrayTip("Comando de envio executado", "SimpliAgenda")
    }
}

F9::ExitApp()
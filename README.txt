SIMPLIAGENDA — ETAPA 1
1. Firebase Authentication > Sign-in method > Email/password: habilitar.
2. Firestore Database: criar banco e publicar o conteúdo de firestore.rules (projeto novo dedicado).
3. Enviar os arquivos para a raiz de um repositório GitHub e ativar Pages (main / root).
4. Authentication > Settings > Authorized domains: adicionar seu usuario.github.io.
5. Abrir o endereço HTTPS do Pages, criar conta e cadastrar estabelecimento.
Teste: criar segunda conta e confirmar que ela não lista os estabelecimentos da primeira.
Esta etapa implementa login, recuperação de senha, cadastro e listagem de estabelecimentos próprios. Apenas perfil proprietário operacional; demais perfis, reservas, fotos, WhatsApp e fidelidade ainda não implementados. Não há envio automático de mensagens. Não foi testado contra o Firebase remoto. Não publicar dados reais antes dos testes de segurança.

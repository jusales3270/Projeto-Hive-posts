import { Context } from 'grammy';

export async function startCommand(ctx: Context) {
  await ctx.reply(
    `Bem-vindo ao InstaPost AI! 🚀

Comandos disponiveis:
/novopost - Criar post interativo
/gerar [tema] - Gerar imagem + legenda automaticamente
/agendar [id] [YYYY-MM-DD HH:mm] - Agendar post
/listar - Listar proximos posts agendados
/publicar [id] - Publicar imediatamente
/cancelar [id] - Cancelar agendamento
/status - Status da conexao Instagram
/tarefas - Listar tarefas dos proximos 7 dias`,
  );
}

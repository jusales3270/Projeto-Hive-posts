import { Context } from 'grammy';
import { api } from './api-client';
import { sendPhoto } from './utils/send-photo';

export async function handleCallbackQuery(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const [action, ...idParts] = data.split('_');
  const postId = idParts.join('_');

  try {
    switch (action) {
      case 'approve':
        await ctx.answerCallbackQuery({ text: 'Post aprovado!' });
        await ctx.reply(`Post ${postId} salvo como rascunho. Use /agendar ou /publicar para continuar.`);
        break;

      case 'publish':
        await ctx.answerCallbackQuery({ text: 'Publicando...' });
        await api.publishPost(postId);
        await ctx.reply('Post publicado com sucesso no Instagram!');
        break;

      case 'regen':
        await ctx.answerCallbackQuery({ text: 'Gerando nova imagem...' });
        await ctx.reply('Gerando nova imagem... Aguarde.');
        try {
          const postData = (await api.getPost(postId)) as any;
          const regenPrompt = postData?.nanoPrompt || 'Regenerate post image';
          const result = await api.generateImage(regenPrompt, postData?.aspectRatio);

          if (postData?.isCarousel) {
            await api.addImageToPost(postId, { imageUrl: result.imageUrl });
            await sendPhoto(ctx, result.imageUrl, { caption: 'Nova imagem adicionada ao carrossel!' });
          } else {
            await api.updatePost(postId, { imageUrl: result.imageUrl });
            await sendPhoto(ctx, result.imageUrl);
          }
        } catch {
          await ctx.reply('Erro ao gerar nova imagem.');
        }
        break;

      case 'schedule': {
        await ctx.answerCallbackQuery({ text: 'Agendando...' });
        // Agenda para 1 hora a partir de agora por padrao
        const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await api.schedulePost(postId, scheduledAt);
        const formatted = new Date(scheduledAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        await ctx.reply(`Post agendado para ${formatted}.\nUse /agendar ${postId} DD/MM HH:MM para alterar.`);
        break;
      }

      case 'cancel':
        await ctx.answerCallbackQuery({ text: 'Cancelado' });
        await api.cancelPost(postId);
        await ctx.reply('Post cancelado.');
        break;

      default:
        await ctx.answerCallbackQuery({ text: 'Acao desconhecida' });
    }
  } catch (err) {
    await ctx.answerCallbackQuery({ text: 'Erro ao processar acao' });
    await ctx.reply('Ocorreu um erro. Tente novamente.');
  }
}

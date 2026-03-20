import { Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { api } from '../api-client';
import { sendPhoto, sendMediaGroup } from '../utils/send-photo';

const VALID_RATIOS = ['1:1', '4:5', '9:16'];

function parseCommand(text: string): { tema: string; aspectRatio: string; count: number } {
  const args = text.replace(/^\/gerar\s*/, '').trim();
  const words = args.split(/\s+/);

  let aspectRatio = '1:1';
  let count = 1;
  let startIdx = 0;

  if (VALID_RATIOS.includes(words[0])) {
    aspectRatio = words[0];
    startIdx = 1;
  }

  const maybeCount = parseInt(words[startIdx], 10);
  if (!isNaN(maybeCount) && maybeCount >= 2 && maybeCount <= 10) {
    count = maybeCount;
    startIdx++;
  }

  const tema = words.slice(startIdx).join(' ');
  return { aspectRatio, tema, count };
}

export async function gerarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const { tema, aspectRatio, count } = parseCommand(text);

  if (!tema) {
    await ctx.reply(
      'Use: /gerar [tamanho] [N] [tema do post]\n\n' +
      'Tamanhos: 1:1 (Feed), 4:5 (Retrato), 9:16 (Stories)\n' +
      'N: numero de imagens (2-10 para carrossel)\n\n' +
      'Exemplos:\n' +
      '  /gerar novidades do Claude 4\n' +
      '  /gerar 3 dicas de produtividade\n' +
      '  /gerar 4:5 5 receitas saudaveis'
    );
    return;
  }

  const isCarousel = count >= 2;
  const ratioLabel = aspectRatio === '4:5' ? 'Retrato' : aspectRatio === '9:16' ? 'Stories' : 'Feed';

  await ctx.reply(
    `Gerando ${isCarousel ? count + ' imagens' : 'imagem'} (${ratioLabel} ${aspectRatio})${isCarousel ? ' carrossel' : ''} e legenda... Aguarde.`
  );

  try {
    // Generate images in parallel + caption
    const imagePromises = Array.from({ length: count }, (_, i) =>
      api.generateImage(
        count > 1 ? `${tema} - variacao ${i + 1} de ${count}` : tema,
        aspectRatio,
      )
    );

    const [captionSettled, ...imageSettled] = await Promise.all([
      api.generateCaption(tema).catch(() => null),
      ...imagePromises.map((p) => p.catch(() => null)),
    ]);

    const captionResult = captionSettled;
    const successfulImages = imageSettled
      .filter((r): r is { imageUrl: string } => !!r?.imageUrl);

    if (successfulImages.length === 0 && !captionResult) {
      await ctx.reply('Erro: nao foi possivel gerar imagem nem legenda. Tente novamente.');
      return;
    }

    const caption = captionResult?.caption || tema;
    const hashtags = captionResult?.hashtags || [];

    // Create post
    const postPayload: Record<string, unknown> = {
      caption,
      hashtags,
      nanoPrompt: tema,
      source: 'TELEGRAM',
      aspectRatio,
    };

    if (successfulImages.length >= 2) {
      postPayload.isCarousel = true;
      postPayload.images = successfulImages.map((img, idx) => ({
        imageUrl: img.imageUrl,
        order: idx,
      }));
    } else if (successfulImages.length === 1) {
      postPayload.imageUrl = successfulImages[0].imageUrl;
    }

    const post = (await api.createPost(postPayload)) as any;

    const keyboard = new InlineKeyboard()
      .text('Aprovar', `approve_${post.id}`)
      .text('Nova Imagem', `regen_${post.id}`)
      .row()
      .text('Publicar Agora', `publish_${post.id}`)
      .text('Agendar', `schedule_${post.id}`)
      .row()
      .text('Cancelar', `cancel_${post.id}`);

    const captionText = `${caption}\n\n${hashtags.map((h: string) => `#${h}`).join(' ')}`;

    let statusMsg = '';
    if (isCarousel && successfulImages.length < count) {
      statusMsg = `\n\n${successfulImages.length}/${count} imagens geradas (algumas falharam).`;
    }
    if (successfulImages.length === 0) {
      statusMsg = '\n\nImagem indisponivel (Gemini sobrecarregado).';
    }

    if (successfulImages.length >= 2) {
      // Send as media group (carousel in Telegram)
      await sendMediaGroup(ctx, successfulImages.map((img) => img.imageUrl), (captionText + statusMsg).slice(0, 1024));
      // Send buttons in separate message (media group doesn't support inline keyboard)
      await ctx.reply(`Carrossel com ${successfulImages.length} imagens gerado!`, { reply_markup: keyboard });
    } else if (successfulImages.length === 1) {
      await sendPhoto(ctx, successfulImages[0].imageUrl, {
        caption: (captionText + statusMsg).slice(0, 1024),
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(captionText + statusMsg, { reply_markup: keyboard });
    }
  } catch (err: any) {
    console.error('[Bot] /gerar failed:', err.message);
    await ctx.reply('Erro ao gerar post. Tente novamente.');
  }
}

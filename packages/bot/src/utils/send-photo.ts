import { Context, InputFile } from 'grammy';

/**
 * Downloads an image from a URL and sends it as a photo via Telegram.
 * Telegram cannot access localhost URLs, so we download and send as buffer.
 */
export async function sendPhoto(
  ctx: Context,
  imageUrl: string,
  options: { caption?: string; reply_markup?: any } = {}
) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const file = new InputFile(buffer, 'post.jpg');
  await ctx.replyWithPhoto(file, options);
}

/**
 * Downloads multiple images and sends them as a media group (carousel) via Telegram.
 * Caption is only set on the first image (Telegram standard behavior).
 */
export async function sendMediaGroup(
  ctx: Context,
  imageUrls: string[],
  caption?: string,
) {
  const media: Array<{ type: 'photo'; media: InputFile; caption?: string }> = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const response = await fetch(imageUrls[i]);
    if (!response.ok) throw new Error(`Failed to fetch image ${i}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const file = new InputFile(buffer, `post_${i}.jpg`);

    media.push({
      type: 'photo',
      media: file,
      ...(i === 0 && caption ? { caption: caption.slice(0, 1024) } : {}),
    });
  }

  await ctx.replyWithMediaGroup(media);
}

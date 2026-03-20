import { api } from '../api-client';
import { CreatePostInput } from '../types';

export async function createPost(input: CreatePostInput) {
  let imageUrl: string | undefined;
  let images: Array<{ imageUrl: string; order: number; prompt?: string }> = [];
  let caption = input.caption;
  let hashtags = input.hashtags;

  // Generate multiple images for carousel
  if (input.image_prompts && input.image_prompts.length >= 2) {
    const results = await Promise.allSettled(
      input.image_prompts.map((prompt) => api.generateImage({ prompt }))
    );
    images = results
      .filter((r): r is PromiseFulfilledResult<{ imageUrl: string; minioKey: string }> => r.status === 'fulfilled')
      .map((r, idx) => ({
        imageUrl: r.value.imageUrl,
        order: idx,
        prompt: input.image_prompts![idx],
      }));
  } else if (input.image_urls && input.image_urls.length >= 2) {
    // Use provided URLs directly
    images = input.image_urls.map((url, idx) => ({
      imageUrl: url,
      order: idx,
    }));
  } else if (input.image_prompt) {
    // Single image (existing behavior)
    const img = await api.generateImage({ prompt: input.image_prompt });
    imageUrl = img.imageUrl;
  }

  if (!caption) {
    const topic = input.image_prompt || input.image_prompts?.[0] || 'post de tecnologia';
    const result = await api.generateCaption({ topic, tone: input.tone });
    caption = result.caption;
    hashtags = hashtags || result.hashtags;
  }

  const isCarousel = images.length >= 2;

  const post = (await api.createPost({
    caption,
    hashtags,
    source: 'MCP',
    isCarousel,
    ...(isCarousel ? { images } : { imageUrl }),
    ...(input.scheduled_at ? { scheduledAt: input.scheduled_at } : {}),
  })) as any;

  return {
    post_id: post.id,
    caption: post.caption,
    image_url: post.imageUrl,
    is_carousel: post.isCarousel,
    image_count: isCarousel ? images.length : (post.imageUrl ? 1 : 0),
    status: post.status,
  };
}

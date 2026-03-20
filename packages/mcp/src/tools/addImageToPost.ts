import { api } from '../api-client';
import { AddImageToPostInput } from '../types';

export async function addImageToPost(input: AddImageToPostInput) {
  let imageUrl = input.image_url;

  if (!imageUrl && input.image_prompt) {
    const img = await api.generateImage({ prompt: input.image_prompt });
    imageUrl = img.imageUrl;
  }

  if (!imageUrl) throw new Error('Provide image_url or image_prompt');

  const result = await api.addImageToPost(input.post_id, { imageUrl });
  return { success: true, image: result };
}

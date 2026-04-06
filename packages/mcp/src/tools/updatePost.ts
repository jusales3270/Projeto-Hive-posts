import { api } from '../api-client';
import { UpdatePostInput } from '../types';

export async function updatePost(input: UpdatePostInput) {
  const { post_id, caption, hashtags, scheduled_at, status } = input;
  const body: Record<string, unknown> = {};
  if (caption !== undefined) body.caption = caption;
  if (hashtags !== undefined) body.hashtags = hashtags;
  if (scheduled_at !== undefined) body.scheduledAt = scheduled_at;
  if (status !== undefined) body.status = status;

  const result = (await api.updatePost(post_id, body)) as any;
  return {
    id: result.id,
    caption: result.caption,
    hashtags: result.hashtags,
    status: result.status,
    scheduledAt: result.scheduledAt,
  };
}

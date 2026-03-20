export interface CreatePostInput {
  caption?: string;
  image_prompt?: string;
  image_prompts?: string[];
  image_urls?: string[];
  scheduled_at?: string;
  hashtags?: string[];
  tone?: string;
}

export interface AddImageToPostInput {
  post_id: string;
  image_prompt?: string;
  image_url?: string;
}

export interface GenerateImageInput {
  prompt: string;
  style?: string;
  aspect_ratio?: '1:1' | '9:16' | '4:5';
}

export interface GenerateCaptionInput {
  topic: string;
  tone?: 'educativo' | 'inspirador' | 'humor' | 'noticia';
  hashtags_count?: number;
  language?: string;
  max_length?: number;
}

export interface SchedulePostInput {
  post_id: string;
  datetime: string;
}

export interface ListPostsInput {
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  limit?: number;
  offset?: number;
}

export interface PublishNowInput {
  post_id: string;
}

export interface UploadImageInput {
  image_base64: string;
  filename: string;
}

export interface GetAnalyticsInput {
  period?: '7d' | '30d' | '90d';
}

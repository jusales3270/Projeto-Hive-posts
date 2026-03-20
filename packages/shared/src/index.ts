// === Enums ===

export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

export enum ImageSource {
  NANOBANA = 'NANOBANA',
  UPLOAD = 'UPLOAD',
  URL = 'URL',
}

export enum PostSource {
  WEB = 'WEB',
  TELEGRAM = 'TELEGRAM',
  MCP = 'MCP',
}

// === Interfaces ===

export interface PostImage {
  id: string;
  imageUrl: string;
  minioKey: string | null;
  order: number;
  source: ImageSource;
  prompt: string | null;
  postId: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  imageSource: ImageSource;
  nanoPrompt: string | null;
  status: PostStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  instagramId: string | null;
  source: PostSource;
  hashtags: string[];
  aspectRatio: string;
  isCarousel: boolean;
  images?: PostImage[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostImageInput {
  imageUrl: string;
  minioKey?: string;
  order: number;
  source?: ImageSource;
  prompt?: string;
}

export interface CreatePostInput {
  caption?: string;
  imageUrl?: string;
  imageSource?: ImageSource;
  nanoPrompt?: string;
  scheduledAt?: string;
  source?: PostSource;
  hashtags?: string[];
  aspectRatio?: string;
  isCarousel?: boolean;
  images?: CreatePostImageInput[];
}

export interface GenerateImageInput {
  prompt: string;
  style?: string;
  aspectRatio?: '1:1' | '9:16' | '4:5';
}

export interface GenerateCaptionInput {
  topic: string;
  tone?: 'educativo' | 'inspirador' | 'humor' | 'noticia';
  hashtagsCount?: number;
  language?: string;
  maxLength?: number;
}

// === API Response types ===

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

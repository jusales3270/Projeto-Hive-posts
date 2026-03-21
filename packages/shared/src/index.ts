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

// === Task & Project Enums ===

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskPlatform {
  YOUTUBE = 'YOUTUBE',
  INSTAGRAM = 'INSTAGRAM',
  META_ADS = 'META_ADS',
  TIKTOK = 'TIKTOK',
  OTHER = 'OTHER',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

// === Task & Project Interfaces ===

export interface Task {
  id: string;
  title: string;
  description: string | null;
  platform: TaskPlatform;
  status: TaskStatus;
  priority: TaskPriority;
  recordDate: Date | null;
  publishDate: Date | null;
  script: string | null;
  driveLink: string | null;
  isSponsored: boolean;
  sponsorName: string | null;
  sponsorBriefing: string | null;
  sponsorContact: string | null;
  sponsorDeadline: Date | null;
  userId: string;
  projectId: string | null;
  project?: { id: string; title: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  modules?: ProjectModule[];
  tasks?: Task[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectModule {
  id: string;
  title: string;
  content: string | null;
  order: number;
  isRecorded: boolean;
  driveLink: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  platform?: TaskPlatform;
  priority?: TaskPriority;
  recordDate?: string;
  publishDate?: string;
  script?: string;
  driveLink?: string;
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorBriefing?: string;
  sponsorContact?: string;
  sponsorDeadline?: string;
  projectId?: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  modules?: { title: string; content?: string; order: number }[];
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

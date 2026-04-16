import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { z } from 'zod';

// Find .env from monorepo root (walk up from current dir)
function findEnvFile(): string | undefined {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const envPath = resolve(dir, '.env');
    if (existsSync(envPath)) return envPath;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

const envPath = findEnvFile();
if (envPath) {
  config({ path: envPath });
} else {
  config(); // fallback to default behavior
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  INSTAGRAM_USER_ID: z.string().optional(),

  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  NANO_BANANA_API_KEY: z.string().optional(),
  NANO_BANANA_PROVIDER: z.enum(['google', 'nanobananaapi', 'fal']).default('google'),
  GEMINI_API_KEY: z.string().optional(),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().optional(),

  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  MINIO_ACCESS_KEY: z.string().transform(v => v || 'minioadmin').default('minioadmin'),
  MINIO_SECRET_KEY: z.string().transform(v => v || 'minioadmin').default('minioadmin'),
  MINIO_PUBLIC_URL: z.string().default('http://localhost:9000'),
  MINIO_BUCKET: z.string().default('instapost-images'),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  MCP_AUTH_TOKEN: z.string().optional(),
  INTERNAL_SERVICE_TOKEN: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();

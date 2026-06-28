import { z } from "zod";

/**
 * Centralized, validated environment configuration.
 *
 * The same application code runs in two modes selected purely by env vars:
 *  - development: Docker Postgres + Redis + MinIO + Mailpit + JWT auth
 *  - production:  Supabase Postgres + Storage + Upstash Redis + Supabase Auth
 *
 * We validate lazily so that client bundles never crash on missing server secrets.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),

  // Auth
  AUTH_PROVIDER: z.enum(["jwt", "supabase"]).default("jwt"),
  JWT_SECRET: z.string().min(16).default("nobelo_dev_secret_change_me_please"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(["minio", "supabase"]).default("minio"),
  S3_ENDPOINT: z.string().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().default("nobelo"),
  S3_SECRET_KEY: z.string().default("nobelo_secret"),
  S3_BUCKET: z.string().default("nobelo-media"),

  // Email (Mailpit in dev)
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  EMAIL_FROM: z.string().default("Novelo <hello@novelo.local>"),

  // Supabase (production)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PROJECT_REF: z.string().optional(),
  SUPABASE_DB_PASSWORD: z.string().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Novelo"),
  NEXT_PUBLIC_GITHUB_URL: z.string().url().default("https://github.com/LeafCoreLabs/novelo"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

const parsedPublic = publicSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/** Access validated server env (server-only). Throws if used in the browser. */
export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must only be called on the server.");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse(process.env);
  }
  return cachedServerEnv;
}

export const publicEnv = parsedPublic;

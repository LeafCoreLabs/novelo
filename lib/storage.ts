import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { serverEnv, publicEnv } from "@/lib/env";

function supabaseStorageConfig() {
  const env = serverEnv();
  const url = env.SUPABASE_URL || publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, apiKey, bucket: env.S3_BUCKET || "novelo-media" };
}

export const UPLOAD_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface UploadedFile {
  url: string;
  path: string;
}

function extensionFromMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

async function uploadLocal(file: File): Promise<UploadedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase() || extensionFromMime(file.type);
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  return { url: `/uploads/${filename}`, path: filename };
}

async function uploadSupabase(file: File): Promise<UploadedFile> {
  const { url, apiKey, bucket } = supabaseStorageConfig();
  if (!url) {
    throw new Error("Supabase storage requires SUPABASE_URL.");
  }
  if (!apiKey) {
    throw new Error("Supabase storage requires SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || extensionFromMime(file.type);
  const objectPath = `uploads/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const supabase = createClient(url, apiKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return { url: data.publicUrl, path: objectPath };
}

/** Upload an image using the configured storage provider. */
export async function uploadImage(file: File): Promise<UploadedFile> {
  const env = serverEnv();

  if (env.STORAGE_PROVIDER === "supabase") {
    return uploadSupabase(file);
  }

  return uploadLocal(file);
}

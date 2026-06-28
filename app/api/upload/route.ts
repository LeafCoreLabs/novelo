import { NextResponse } from "next/server";

import { getSession, isAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, UPLOAD_MIME_TYPES, uploadImage } from "@/lib/storage";

export const runtime = "nodejs";

/** Thumbnail/media upload (admin only). Uses local disk or Supabase Storage. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!UPLOAD_MIME_TYPES.includes(file.type as (typeof UPLOAD_MIME_TYPES)[number])) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 413 });
  }

  try {
    const uploaded = await uploadImage(file);
    return NextResponse.json({ url: uploaded.url, path: uploaded.path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

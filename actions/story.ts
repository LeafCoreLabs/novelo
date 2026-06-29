"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countStoryPages } from "@/lib/reader-pages";
import { slugify } from "@/lib/utils";

export interface StoryFormState {
  error?: string;
}

const storySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  excerpt: z.string().min(10, "Add a short preview/teaser (at least 10 characters)."),
  content: z.string().min(20, "Story content is too short."),
  coverUrl: z.string().min(1, "Add a thumbnail image."),
  genreId: z.string().optional(),
  publish: z.string().optional(),
  agreeWriterTerms: z.literal("on", {
    message: "You must agree to the writer terms before publishing.",
  }),
});

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "story";
  let slug = root;
  let n = 1;
  while (await prisma.story.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export async function createStoryAction(
  _prev: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const session = await getSession();
  if (!isAdmin(session) || !session) return { error: "Not authorized." };

  const parsed = storySchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverUrl: formData.get("coverUrl"),
    genreId: formData.get("genreId") || undefined,
    publish: formData.get("publish") ?? undefined,
    agreeWriterTerms: formData.get("agreeWriterTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid story details." };
  }

  const data = parsed.data;
  const published = data.publish === "on" || data.publish === "true";
  let slug: string;

  const duplicate = await prisma.story.findFirst({
    where: {
      authorId: session.id,
      title: data.title,
      deletedAt: null,
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
    select: { slug: true },
  });
  if (duplicate) {
    return { error: "You just published this story. Check your dashboard." };
  }

  const pageCount = countStoryPages(data.content);

  try {
    slug = await uniqueSlug(data.title);
    await prisma.story.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverUrl: data.coverUrl,
        priceCents: 0,
        genreId: data.genreId || null,
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
        pageCount,
        authorId: session.id,
      },
    });

    await prisma.user.update({
      where: { id: session.id },
      data: { writerTermsAcceptedAt: new Date() },
    });
  } catch {
    return { error: "Could not save the story. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/stories");
  revalidateTag("landing");
  redirect(`/admin?published=${encodeURIComponent(slug)}`);
}

export async function deleteStoryAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/login?next=/admin");

  const storyId = String(formData.get("storyId") ?? "");
  if (!storyId) redirect("/admin");

  await prisma.story.update({
    where: { id: storyId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/stories");
  revalidateTag("landing");
  redirect("/admin");
}

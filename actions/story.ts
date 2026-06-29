"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  countStoryPagesFromChapters,
  mergeChapterContent,
  parseChaptersJson,
  wordCount,
  type ChapterInput,
} from "@/lib/story-chapters";
import { slugify } from "@/lib/utils";

export interface StoryFormState {
  error?: string;
}

const storySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  excerpt: z.string().min(10, "Add a short preview/teaser (at least 10 characters)."),
  coverUrl: z.string().min(1, "Add a thumbnail image."),
  genreId: z.string().optional(),
  publish: z.string().optional(),
  agreeWriterTerms: z.literal("on", {
    message: "You must agree to the writer terms before publishing.",
  }).optional(),
});

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function uniqueSlug(base: string, excludeStoryId?: string): Promise<string> {
  const root = slugify(base) || "story";
  let slug = root;
  let n = 1;
  while (true) {
    const existing = await prisma.story.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeStoryId) break;
    slug = `${root}-${n++}`;
  }
  return slug;
}

function validateChapters(chapters: ChapterInput[]): string | null {
  if (chapters.length === 0) return "Add at least one chapter.";
  for (const chapter of chapters) {
    if (chapter.content.trim().length < 20) {
      return `"${chapter.title}" needs at least 20 characters of content.`;
    }
  }
  return null;
}

async function upsertChapters(
  storyId: string,
  chapters: ChapterInput[],
  published: boolean,
) {
  const existing = await prisma.chapter.findMany({
    where: { storyId, deletedAt: null },
    select: { id: true },
  });
  const keepIds = new Set(chapters.map((c) => c.id).filter(Boolean));

  const toDelete = existing.filter((c) => !keepIds.has(c.id)).map((c) => c.id);
  if (toDelete.length > 0) {
    await prisma.chapter.deleteMany({ where: { id: { in: toDelete } } });
  }

  // Soft-deleted rows still occupy the (storyId, order) unique index — remove them.
  await prisma.chapter.deleteMany({
    where: { storyId, deletedAt: { not: null } },
  });

  // Avoid order unique collisions while rewriting rows.
  for (let i = 0; i < chapters.length; i += 1) {
    const chapter = chapters[i];
    if (chapter?.id) {
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { order: 10_000 + i },
      });
    }
  }

  for (let i = 0; i < chapters.length; i += 1) {
    const chapter = chapters[i]!;
    const data = {
      title: chapter.title,
      order: i + 1,
      content: chapter.content,
      wordCount: wordCount(chapter.content),
      status: published ? ("PUBLISHED" as const) : ("DRAFT" as const),
      publishedAt: published ? new Date() : null,
      deletedAt: null,
    };

    if (chapter.id) {
      await prisma.chapter.update({ where: { id: chapter.id }, data });
    } else {
      await prisma.chapter.create({ data: { ...data, storyId } });
    }
  }
}

function revalidateStoryPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/stories");
  revalidatePath(`/story/${slug}`);
  revalidateTag("landing");
}

export async function createStoryAction(
  _prev: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const session = await getSession();
  if (!isAdmin(session) || !session) return { error: "Not authorized." };

  const chapters = parseChaptersJson(String(formData.get("chaptersJson") ?? ""));
  const chapterError = validateChapters(chapters);
  if (chapterError) return { error: chapterError };

  const parsed = storySchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    coverUrl: formData.get("coverUrl"),
    genreId: formData.get("genreId") || undefined,
    publish: formData.get("publish") ?? undefined,
    agreeWriterTerms: formData.get("agreeWriterTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid story details." };
  }

  if (parsed.data.agreeWriterTerms !== "on") {
    return { error: "You must agree to the writer terms before publishing." };
  }

  const data = parsed.data;
  const published = data.publish === "on" || data.publish === "true";
  const mergedContent = mergeChapterContent(chapters);
  const pageCount = countStoryPagesFromChapters(chapters);

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

  let slug: string;

  try {
    slug = await uniqueSlug(data.title);
    const story = await prisma.story.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: mergedContent,
        coverUrl: data.coverUrl,
        priceCents: 0,
        genreId: data.genreId || null,
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
        pageCount,
        authorId: session.id,
      },
    });

    await upsertChapters(story.id, chapters, published);

    await prisma.user.update({
      where: { id: session.id },
      data: { writerTermsAcceptedAt: new Date() },
    });

    revalidateStoryPaths(slug);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("[createStoryAction]", error);
    return { error: "Could not save the story. Please try again." };
  }

  redirect(`/admin?published=${encodeURIComponent(slug)}`);
}

export async function updateStoryAction(
  _prev: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const session = await getSession();
  if (!isAdmin(session) || !session) return { error: "Not authorized." };

  const storyId = String(formData.get("storyId") ?? "");
  if (!storyId) return { error: "Story not found." };

  const existing = await prisma.story.findFirst({
    where: { id: storyId, authorId: session.id, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) return { error: "Story not found or you cannot edit it." };

  const chapters = parseChaptersJson(String(formData.get("chaptersJson") ?? ""));
  const chapterError = validateChapters(chapters);
  if (chapterError) return { error: chapterError };

  const parsed = storySchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    coverUrl: formData.get("coverUrl"),
    genreId: formData.get("genreId") || undefined,
    publish: formData.get("publish") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid story details." };
  }

  const data = parsed.data;
  const published = data.publish === "on" || data.publish === "true";
  const mergedContent = mergeChapterContent(chapters);
  const pageCount = countStoryPagesFromChapters(chapters);

  let slug = existing.slug;

  try {
    const story = await prisma.story.update({
      where: { id: storyId },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: mergedContent,
        coverUrl: data.coverUrl,
        genreId: data.genreId || null,
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
        pageCount,
      },
    });

    await upsertChapters(story.id, chapters, published);
    slug = story.slug;
    revalidateStoryPaths(slug);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("[updateStoryAction]", error);
    return { error: "Could not update the story. Please try again." };
  }

  redirect(`/admin?updated=${encodeURIComponent(slug)}`);
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

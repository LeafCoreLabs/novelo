import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StoryForm } from "@/components/admin/story-form";
import type { StoryFormInitial } from "@/components/admin/story-form/story-form-shell";
import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoryForEdit } from "@/services/story.service";

export const metadata: Metadata = { title: "Edit story" };

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!isAdmin(session) || !session) redirect("/login?next=/admin");

  const { slug } = await params;
  let story = await getStoryForEdit(slug, session.id);
  if (!story) notFound();

  if (story.chapters.length === 0 && story.content.trim()) {
    await prisma.chapter.create({
      data: {
        storyId: story.id,
        title: "Chapter 1",
        order: 1,
        content: story.content,
        status: story.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        wordCount: story.content.trim().split(/\s+/).filter(Boolean).length,
      },
    });
    story = await getStoryForEdit(slug, session.id);
    if (!story) notFound();
  }

  const initialStory: StoryFormInitial = {
    storyId: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    coverUrl: story.coverUrl,
    genreId: story.genreId,
    published: story.status === "PUBLISHED",
    chapters: story.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      content: ch.content,
      order: ch.order,
    })),
  };

  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-1 pb-8 sm:px-0">
      <Link href="/admin" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Edit story</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Update chapters, cover, and metadata. Changes apply to the live reader immediately after
        saving.
      </p>
      <div className="mt-8">
        <StoryForm initialStory={initialStory} genres={genres} />
      </div>
    </div>
  );
}

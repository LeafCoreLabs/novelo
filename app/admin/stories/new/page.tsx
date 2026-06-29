import type { Metadata } from "next";
import Link from "next/link";

import { StoryForm } from "@/components/admin/story-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "New story" };

export default async function NewStoryPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-1 pb-8 sm:px-0">
      <Link href="/admin" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Write a story</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Add a thumbnail, a teaser, and the full text. Readers get the first five pages free; sign-in
        unlocks the rest.
      </p>
      <div className="mt-8">
        <StoryForm genres={genres} />
      </div>
    </div>
  );
}

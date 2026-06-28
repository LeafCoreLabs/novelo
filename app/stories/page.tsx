import type { Metadata } from "next";
import Link from "next/link";

import { StoryCard } from "@/components/landing/story-card";
import { SiteNav } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { getPublishedStoriesPaginated } from "@/services/story.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All stories",
  description: "Browse every published story on Novelo.",
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { stories, total, totalPages, page: currentPage } = await getPublishedStoriesPaginated(page);

  return (
    <>
      <SiteNav />
      <main className="relative pt-28 pb-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Full library
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Every story.
            </h1>
            <p className="mt-3 text-[var(--color-muted)]">
              {total} {total === 1 ? "story" : "stories"} published. Read the first 5 pages free — sign in
              to continue.
            </p>
          </div>

          {stories.length === 0 ? (
            <div className="glass mt-12 rounded-[var(--radius-card)] px-6 py-16 text-center text-[var(--color-muted)]">
              No stories published yet. Check back soon.
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Stories pagination"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              {currentPage > 1 && (
                <Link href={`/stories?page=${currentPage - 1}`}>
                  <Button variant="glass" size="sm">
                    ← Previous
                  </Button>
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link key={pageNum} href={`/stories?page=${pageNum}`}>
                  <Button
                    variant={pageNum === currentPage ? "primary" : "glass"}
                    size="sm"
                    className="min-w-10"
                  >
                    {pageNum}
                  </Button>
                </Link>
              ))}

              {currentPage < totalPages && (
                <Link href={`/stories?page=${currentPage + 1}`}>
                  <Button variant="glass" size="sm">
                    Next →
                  </Button>
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}

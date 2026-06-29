import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoryPager({
  slug,
  currentPage,
  totalPages,
  maxAccessiblePage,
  freePreviewCount,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
  maxAccessiblePage: number;
  freePreviewCount: number;
}) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const nextLocked = nextPage !== null && nextPage > maxAccessiblePage;
  const lockedCount = Math.max(totalPages - maxAccessiblePage, 0);

  return (
    <nav
      aria-label="Story pages"
      className="mt-10 flex flex-col items-center gap-4 border-t border-[var(--color-border)] pt-8"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          Page {currentPage} of {totalPages}
        </p>
        {lockedCount > 0 && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Free preview · pages 1–{Math.min(freePreviewCount, totalPages)}
            {lockedCount > 0 ? ` · ${lockedCount} locked` : ""}
          </p>
        )}
      </div>

      <div className="flex max-w-full flex-wrap items-center justify-center gap-2 px-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const locked = pageNum > maxAccessiblePage;
          const active = pageNum === currentPage;

          if (locked) {
            return (
              <span
                key={pageNum}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs text-[var(--color-muted)]"
                title="Sign in to read"
              >
                <Lock className="h-3 w-3" />
              </span>
            );
          }

          return (
            <Link
              key={pageNum}
              href={`/story/${slug}?page=${pageNum}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                active
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-white/5 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-foreground)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      <div className="flex w-full max-w-sm items-center justify-between gap-3">
        {prevPage ? (
          <Link href={`/story/${slug}?page=${prevPage}`} className="flex-1">
            <Button variant="glass" size="sm" className="w-full">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextPage && !nextLocked ? (
          <Link href={`/story/${slug}?page=${nextPage}`} className="flex-1">
            <Button size="sm" className="w-full">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : nextLocked ? (
          <Button size="sm" className="flex-1" disabled>
            <Lock className="h-4 w-4" /> Locked
          </Button>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}

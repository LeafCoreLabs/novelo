import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageNumbers(current: number, total: number, maxAccessible: number): number[] {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total]);
  for (let i = current - 3; i <= current + 3; i += 1) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  for (let i = 1; i <= Math.min(maxAccessible, 3); i += 1) {
    pages.add(i);
  }

  return [...pages].sort((a, b) => a - b);
}

export function StoryPager({
  slug,
  currentPage,
  totalPages,
  maxAccessiblePage,
  freePreviewCount,
  isLoggedIn,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
  maxAccessiblePage: number;
  freePreviewCount: number;
  isLoggedIn: boolean;
}) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const nextLocked = nextPage !== null && nextPage > maxAccessiblePage;
  const lockedCount = Math.max(totalPages - maxAccessiblePage, 0);
  const visiblePages = pageNumbers(currentPage, totalPages, maxAccessiblePage);

  return (
    <>
      <nav
        aria-label="Story pages"
        className="mt-8 hidden flex-col items-center gap-4 border-t border-[var(--color-border)] pt-8 sm:mt-10 sm:flex"
      >
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            Page {currentPage} of {totalPages}
          </p>
          {!isLoggedIn && lockedCount > 0 && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Free preview · pages 1–{Math.min(freePreviewCount, totalPages)}
              {lockedCount > 0 ? ` · ${lockedCount} locked` : ""}
            </p>
          )}
        </div>

        <div className="flex max-w-full flex-wrap items-center justify-center gap-2 px-2">
          {visiblePages.map((pageNum, index) => {
            const prevNum = visiblePages[index - 1];
            const showEllipsis = prevNum !== undefined && pageNum - prevNum > 1;
            const locked = pageNum > maxAccessiblePage;
            const active = pageNum === currentPage;

            return (
              <span key={pageNum} className="flex items-center gap-2">
                {showEllipsis && (
                  <span className="px-1 text-xs text-[var(--color-muted)]">…</span>
                )}
                {locked ? (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs text-[var(--color-muted)]"
                    title="Sign in to read"
                  >
                    <Lock className="h-3 w-3" />
                  </span>
                ) : (
                  <Link
                    href={`/story/${slug}?page=${pageNum}`}
                    prefetch={Math.abs(pageNum - currentPage) <= 1}
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
                )}
              </span>
            );
          })}
        </div>

        <div className="flex w-full max-w-sm items-center justify-between gap-3">
          {prevPage ? (
            <Link href={`/story/${slug}?page=${prevPage}`} prefetch className="flex-1">
              <Button variant="glass" size="sm" className="w-full">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextPage && !nextLocked ? (
            <Link href={`/story/${slug}?page=${nextPage}`} prefetch className="flex-1">
              <Button size="sm" className="w-full">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : nextLocked ? (
            <Link href="#sign-in-gate" scroll className="flex-1">
              <Button size="sm" className="w-full">
                <Lock className="h-4 w-4" /> Sign in
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </nav>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          {prevPage ? (
            <Link href={`/story/${slug}?page=${prevPage}`} prefetch className="flex-1">
              <Button variant="glass" size="sm" className="w-full">
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <span className="shrink-0 text-xs font-medium text-[var(--color-muted)]">
            {currentPage} / {totalPages}
          </span>

          {nextPage && !nextLocked ? (
            <Link href={`/story/${slug}?page=${nextPage}`} prefetch className="flex-1">
              <Button size="sm" className="w-full">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : nextLocked ? (
            <Link href="#sign-in-gate" scroll className="flex-1">
              <Button size="sm" className="w-full">
                <Lock className="h-4 w-4" /> Sign in
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </>
  );
}

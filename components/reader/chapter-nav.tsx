import Link from "next/link";

import { cn } from "@/lib/utils";
import { storyUrl } from "@/lib/story-chapters";
import type { ReaderChapter } from "@/lib/story-chapters";

export function ChapterNav({
  slug,
  chapters,
  currentChapterOrder,
  maxAccessibleGlobalPage,
  isLoggedIn,
}: {
  slug: string;
  chapters: ReaderChapter[];
  currentChapterOrder: number;
  maxAccessibleGlobalPage: number;
  isLoggedIn: boolean;
}) {
  if (chapters.length <= 1) return null;

  return (
    <nav aria-label="Chapters" className="mb-4 sm:mb-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
        Chapters
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chapters.map((chapter) => {
          const chapterStart = chapter.globalStartPage;
          const locked = !isLoggedIn && chapterStart > maxAccessibleGlobalPage;
          const active = chapter.order === currentChapterOrder;

          if (locked) {
            return (
              <span
                key={chapter.id}
                className="shrink-0 rounded-full border border-[var(--color-border)] bg-white/5 px-3 py-1.5 text-xs text-[var(--color-muted)]"
                title="Sign in to read"
              >
                {chapter.title}
              </span>
            );
          }

          const href = storyUrl(slug, chapter.order, 1);

          return (
            <Link
              key={chapter.id}
              href={href}
              prefetch={Math.abs(chapter.order - currentChapterOrder) <= 1}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-foreground)]"
                  : "border-[var(--color-border)] bg-white/5 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-foreground)]",
              )}
              aria-current={active ? "page" : undefined}
              title={`${chapter.pageCount} pages`}
            >
              {chapter.title}
            </Link>
          );
        })}
      </div>
      {!isLoggedIn && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Locked chapters unlock after you sign in past the free preview.
        </p>
      )}
    </nav>
  );
}

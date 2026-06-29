import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { storyUrl } from "@/lib/story-chapters";
import { FREE_PREVIEW_PAGE_COUNT } from "@/services/story.service";

export function SignInGate({
  slug,
  title,
  lockedRemaining,
  unit = "sections",
  nextChapterOrder = 1,
  nextPageInChapter = FREE_PREVIEW_PAGE_COUNT + 1,
}: {
  slug: string;
  title: string;
  lockedRemaining: number;
  unit?: "pages" | "sections";
  nextChapterOrder?: number;
  nextPageInChapter?: number;
}) {
  const next = storyUrl(slug, nextChapterOrder, nextPageInChapter);
  const label = unit === "pages" ? "page" : "section";

  return (
    <div className="glass-strong mt-4 rounded-[var(--radius-card)] p-6 text-center sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
        <LogIn className="h-5 w-5" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold sm:text-2xl">
        Sign in to keep reading
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
        {lockedRemaining > 0
          ? `You’ve reached the end of the free preview of “${title}”. Sign in to continue — ${lockedRemaining} more ${
              lockedRemaining === 1 ? label : `${label}s`
            } await.`
          : `Sign in to finish reading “${title}”.`}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={`/login?next=${encodeURIComponent(next)}`}>
          <Button size="lg" className="group w-full sm:w-auto">
            <LogIn className="h-4 w-4" />
            Sign in
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`}>
          <Button variant="glass" size="lg" className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4" />
            Create account
          </Button>
        </Link>
      </div>
    </div>
  );
}

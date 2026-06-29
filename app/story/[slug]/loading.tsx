import { BookOpen } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";

export default function StoryLoading() {
  return (
    <>
      <SiteNav />
      <main className="relative pt-20 pb-24 sm:pt-28 sm:pb-28">
        <div className="container-page">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-6 grid gap-6 sm:grid-cols-[200px_1fr] sm:gap-8">
            <div className="mx-auto aspect-[3/4] w-36 animate-pulse rounded-2xl bg-white/10 sm:mx-0 sm:w-full" />
            <div className="flex flex-col justify-end gap-3">
              <div className="mx-auto h-3 w-20 animate-pulse rounded bg-white/10 sm:mx-0" />
              <div className="mx-auto h-8 w-3/4 max-w-md animate-pulse rounded bg-white/10 sm:mx-0 sm:h-12 sm:w-full" />
              <div className="mx-auto h-4 w-32 animate-pulse rounded bg-white/10 sm:mx-0" />
            </div>
          </div>
        </div>

        <div className="container-page mt-8 sm:mt-12">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 h-12 animate-pulse rounded-2xl bg-white/5" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 py-8">
              <BookOpen className="h-6 w-6 animate-pulse text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-muted)]">Loading story…</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

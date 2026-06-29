import { Eye, PenLine, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PublishSuccessBanner } from "@/components/admin/publish-success-banner";
import { DeleteStoryButton } from "@/components/admin/delete-story-button";
import { Button } from "@/components/ui/button";
import { formatCompact } from "@/lib/utils";
import { listAdminStories } from "@/services/story.service";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>;
}) {
  const { published } = await searchParams;
  const stories = await listAdminStories();

  return (
    <div>
      {published ? <PublishSuccessBanner slug={published} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Your stories</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Write, publish, and share your work. Published stories appear on the homepage.
          </p>
        </div>
        <Link href="/admin/stories/new">
          <Button size="lg">
            <Plus className="h-4 w-4" /> New story
          </Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] glass">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <PenLine className="h-8 w-8 text-[var(--color-muted)]" />
            <p className="text-[var(--color-muted)]">No stories yet. Write your first one.</p>
            <Link href="/admin/stories/new">
              <Button>Write a story</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {stories.map((s) => (
              <li key={s.id} className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {s.coverUrl && (
                    <Image src={s.coverUrl} alt={s.title} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatCompact(s.readsCount)} reads
                  </p>
                </div>
                <span
                  className={
                    s.status === "PUBLISHED"
                      ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300"
                      : "rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--color-muted)]"
                  }
                >
                  {s.status.toLowerCase()}
                </span>
                <Link href={`/story/${s.slug}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </Link>
                <DeleteStoryButton storyId={s.id} title={s.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

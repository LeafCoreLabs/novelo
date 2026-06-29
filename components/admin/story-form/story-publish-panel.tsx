import Link from "next/link";

import { StoryMetaFields } from "@/components/admin/story-form/story-meta-fields";
import { Button } from "@/components/ui/button";

export function StoryPublishPanel({
  genres,
  error,
  pending,
  uploading,
  publishedRecently,
  showMeta = true,
  showDesktopSubmit = true,
}: {
  genres: { id: string; name: string }[];
  error?: string;
  pending: boolean;
  uploading: boolean;
  publishedRecently: boolean;
  showMeta?: boolean;
  showDesktopSubmit?: boolean;
}) {
  return (
    <>
      {showMeta && <StoryMetaFields genres={genres} />}

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="publish"
          defaultChecked
          disabled={publishedRecently}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        Publish now (uncheck to save as draft)
      </label>

      <label className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
        <input
          type="checkbox"
          name="agreeWriterTerms"
          required
          disabled={publishedRecently}
          className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-[var(--color-accent)] hover:underline">
            writer terms
          </Link>{" "}
          and confirm I have the rights to publish this story.
        </span>
      </label>

      {publishedRecently && (
        <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          This story was just published. Return to the dashboard to write another.
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {showDesktopSubmit && (
        <div className="hidden md:block">
          <Button type="submit" size="lg" disabled={pending || uploading || publishedRecently}>
            {pending ? "Publishing…" : "Publish story"}
          </Button>
        </div>
      )}
    </>
  );
}

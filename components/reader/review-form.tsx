"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { submitReviewAction, type ReviewState } from "@/actions/review";
import { Button } from "@/components/ui/button";

const initial: ReviewState = {};

export function ReviewForm({
  storyId,
  slug,
  existing,
}: {
  storyId: string;
  slug: string;
  existing?: string;
}) {
  const [state, formAction, pending] = useActionState(submitReviewAction, initial);

  if (state.ok) {
    return (
      <div className="glass mt-10 flex items-center gap-2 rounded-[var(--radius-card)] px-5 py-4 text-sm text-emerald-300">
        <Check className="h-4 w-4" />
        Thanks — your review may appear in “Readers and writers agree.”
      </div>
    );
  }

  return (
    <div className="glass mt-10 rounded-[var(--radius-card)] p-6">
      <h3 className="font-display text-lg font-semibold">Share your take</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Signed-in readers can leave a review. It may show on the homepage.
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="storyId" value={storyId} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="rating" value="5" />

        <textarea
          name="body"
          required
          rows={3}
          defaultValue={existing}
          placeholder="What did you think of this story?"
          className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        {state.error && (
          <p className="text-sm text-red-300">{state.error}</p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : existing ? "Update review" : "Post review"}
        </Button>
      </form>

      <p className="mt-3 text-xs text-[var(--color-muted)]">
        By posting, you agree to our{" "}
        <Link href="/terms" className="text-[var(--color-accent)] hover:underline">
          Terms
        </Link>
        .
      </p>
    </div>
  );
}

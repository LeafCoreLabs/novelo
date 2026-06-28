import { BookOpen, Check, Lock, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { unlockStoryAction } from "@/actions/story";
import { ReviewForm } from "@/components/reader/review-form";
import { SignInGate } from "@/components/reader/sign-in-gate";
import { UnlockButton } from "@/components/reader/unlock-button";
import { SiteNav } from "@/components/site/site-nav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCompact } from "@/lib/utils";
import {
  getStoryBySlug,
  getVisibleParagraphCount,
  splitStoryParagraphs,
  userHasAccess,
} from "@/services/story.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  return { title: story?.title ?? "Story", description: story?.excerpt };
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [story, session] = await Promise.all([getStoryBySlug(slug), getSession()]);
  if (!story) notFound();

  const hasAccess = session
    ? await userHasAccess(
        session.id,
        { id: story.id, priceCents: story.priceCents, authorId: story.authorId },
        session.role,
      )
    : false;

  const existingReview =
    session && session.id !== story.authorId
      ? await prisma.review.findUnique({
          where: { storyId_userId: { storyId: story.id, userId: session.id } },
          select: { body: true },
        })
      : null;

  if (session) {
    prisma.story
      .update({ where: { id: story.id }, data: { readsCount: { increment: 1 } } })
      .catch(() => {});
  }

  const paragraphs = splitStoryParagraphs(story.content);
  const visibleCount = getVisibleParagraphCount(paragraphs.length, hasAccess);
  const visibleParas = paragraphs.slice(0, visibleCount);
  const lockedRemaining = paragraphs.length - visibleCount;
  const showSignInGate = !session && lockedRemaining > 0;
  const showPaymentGate = Boolean(session) && !hasAccess && story.priceCents > 0;
  const fadeLastParagraph =
    (showSignInGate || (showPaymentGate && lockedRemaining > 0)) && visibleParas.length > 0;
  const authorName = story.author?.profile?.displayName ?? "Ravi Ranjan";

  return (
    <>
      <SiteNav />
      <main className="relative pt-28 pb-28">
        <div className="container-page">
          <Link
            href="/#latest"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            ← Back to stories
          </Link>

          <div className="mt-6 grid gap-8 sm:grid-cols-[200px_1fr]">
            <div className="relative mx-auto aspect-[3/4] w-44 overflow-hidden rounded-2xl shadow-[var(--shadow-glow)] sm:mx-0 sm:w-full">
              <Image
                src={story.coverUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80"}
                alt={story.title}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-end">
              {story.genre && (
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  {story.genre.name}
                </span>
              )}
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {story.title}
              </h1>
              <p className="mt-3 text-[var(--color-muted)]">by {authorName}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-current" /> {(story.ratingAvg || 4.8).toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> {formatCompact(story.readsCount)} reads
                </span>
                <span
                  className={
                    story.priceCents > 0
                      ? "flex items-center gap-1 font-medium text-[var(--color-accent)]"
                      : "font-medium text-emerald-400"
                  }
                >
                  {story.priceCents > 0 ? (
                    <>
                      <Lock className="h-3.5 w-3.5" /> {dollars(story.priceCents)}
                    </>
                  ) : (
                    "Free to read"
                  )}
                </span>
                {hasAccess && story.priceCents > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="h-4 w-4" /> Unlocked
                  </span>
                )}
                {!session && lockedRemaining > 0 && (
                  <span className="text-[var(--color-muted)]">Free preview · 2 sections</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <article className="container-page mt-12">
          <div className="mx-auto max-w-2xl">
            <p className="text-lg font-medium leading-relaxed text-[var(--color-foreground)]">
              {story.excerpt}
            </p>

            <div className="prose-reader mt-6 space-y-5 text-[var(--color-foreground)]/85">
              {visibleParas.map((p, i) => {
                const isLast = fadeLastParagraph && i === visibleParas.length - 1;
                return (
                  <p
                    key={i}
                    className={isLast ? "relative" : ""}
                    style={
                      isLast
                        ? {
                            maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, black 30%, transparent 100%)",
                          }
                        : undefined
                    }
                  >
                    {p}
                  </p>
                );
              })}
            </div>

            {showSignInGate && (
              <SignInGate slug={story.slug} title={story.title} lockedRemaining={lockedRemaining} />
            )}

            {showPaymentGate && (
              <div className="glass-strong mt-4 rounded-[var(--radius-card)] p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">Keep reading</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
                  {lockedRemaining > 0
                    ? `Unlock the rest of “${story.title}” — ${lockedRemaining} more ${
                        lockedRemaining === 1 ? "section" : "sections"
                      } await. One-time payment, yours forever.`
                    : `Unlock the full story. One-time payment, yours forever.`}
                </p>

                <form
                  action={unlockStoryAction}
                  className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
                >
                  <input type="hidden" name="storyId" value={story.id} />
                  <input type="hidden" name="slug" value={story.slug} />
                  <UnlockButton label={`Unlock for ${dollars(story.priceCents)}`} />
                </form>
              </div>
            )}

            {hasAccess && paragraphs.length === 0 && (
              <p className="mt-6 text-[var(--color-muted)]">This story has no content yet.</p>
            )}

            {session && session.id !== story.authorId && (
              <ReviewForm storyId={story.id} slug={story.slug} existing={existingReview?.body} />
            )}
          </div>
        </article>
      </main>
    </>
  );
}

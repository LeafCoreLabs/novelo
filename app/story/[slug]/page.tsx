import { BookOpen, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChapterNav } from "@/components/reader/chapter-nav";
import { ReaderScrollReset } from "@/components/reader/reader-scroll-reset";
import { ReviewForm } from "@/components/reader/review-form";
import { SignInGate } from "@/components/reader/sign-in-gate";
import { StoryPager } from "@/components/reader/story-pager";
import { StoryReaderUnlock } from "@/components/reader/story-reader-unlock";
import { SiteNav } from "@/components/site/site-nav";
import { getSession } from "@/lib/auth";
import {
  buildReaderChapters,
  chapterPositionToGlobalPage,
  globalPageToChapterPosition,
  storyUrl,
  totalReaderPages,
} from "@/lib/story-chapters";
import { prisma } from "@/lib/prisma";
import { formatCompact } from "@/lib/utils";
import {
  FREE_PREVIEW_PAGE_COUNT,
  getStoryBySlug,
  getVisiblePageCount,
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

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; chapter?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam, chapter: chapterParam } = await searchParams;
  const [story, session] = await Promise.all([getStoryBySlug(slug), getSession()]);
  if (!story) notFound();

  const readerChapters = buildReaderChapters(
    story.chapters.map((ch) => ({
      id: ch.id,
      order: ch.order,
      title: ch.title,
      content: ch.content,
    })),
  );

  const totalPages = totalReaderPages(readerChapters);
  const isLoggedIn = Boolean(session);
  const maxAccessibleGlobalPage = getVisiblePageCount(totalPages, isLoggedIn);

  let chapterOrder = Math.max(1, Number.parseInt(chapterParam ?? "1", 10) || 1);
  let pageInChapter = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  if (!chapterParam && pageParam) {
    const legacyGlobal = Math.max(1, Number.parseInt(pageParam, 10) || 1);
    const resolved = globalPageToChapterPosition(readerChapters, legacyGlobal);
    if (resolved) {
      redirect(storyUrl(slug, resolved.chapter.order, resolved.pageInChapter));
    }
  }

  const currentChapter = readerChapters.find((c) => c.order === chapterOrder) ?? readerChapters[0];
  if (!currentChapter) notFound();

  chapterOrder = currentChapter.order;
  pageInChapter = Math.min(Math.max(1, pageInChapter), currentChapter.pageCount);

  const globalPage =
    chapterPositionToGlobalPage(readerChapters, chapterOrder, pageInChapter) ?? 1;

  if (globalPage > maxAccessibleGlobalPage) {
    const maxPos = globalPageToChapterPosition(readerChapters, maxAccessibleGlobalPage);
    if (maxPos) {
      redirect(storyUrl(slug, maxPos.chapter.order, maxPos.pageInChapter));
    }
  }

  const pageContent = currentChapter.pages[pageInChapter - 1] ?? "";
  const lockedPages = totalPages - maxAccessibleGlobalPage;
  const showSignInGate = !session && lockedPages > 0 && globalPage >= maxAccessibleGlobalPage;
  const showFullHeader = globalPage === 1;

  const nextLockedPos = globalPageToChapterPosition(readerChapters, maxAccessibleGlobalPage + 1);

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

  const authorName = story.author?.profile?.displayName ?? "Ravi Ranjan";

  return (
    <>
      <SiteNav />
      <main className="relative pt-20 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:pt-28 sm:pb-28">
        {!showFullHeader && (
          <div className="sticky top-[4.5rem] z-20 border-b border-[var(--color-border)] bg-[var(--color-background)] sm:hidden">
            <div className="container-page flex items-center justify-between gap-3 py-2.5">
              <Link
                href="/stories"
                className="shrink-0 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                ← Stories
              </Link>
              <p className="min-w-0 truncate text-sm font-medium">{currentChapter.title}</p>
              <span className="shrink-0 text-xs text-[var(--color-muted)]">
                {pageInChapter}/{currentChapter.pageCount}
              </span>
            </div>
          </div>
        )}

        {showFullHeader && (
          <div className="container-page">
            <Link
              href="/stories"
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              ← All stories
            </Link>

            <div className="mt-4 grid gap-6 sm:mt-6 sm:grid-cols-[200px_1fr] sm:gap-8">
              <div className="relative mx-auto aspect-[3/4] w-36 overflow-hidden rounded-2xl shadow-[var(--shadow-glow)] sm:mx-0 sm:w-full">
                <Image
                  src={story.coverUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80"}
                  alt={story.title}
                  fill
                  sizes="(max-width: 640px) 144px, 200px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-end text-center sm:text-left">
                {story.genre && (
                  <span className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    {story.genre.name}
                  </span>
                )}
                <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  {story.title}
                </h1>
                <p className="mt-2 text-[var(--color-muted)] sm:mt-3">by {authorName}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--color-muted)] sm:mt-4 sm:justify-start sm:gap-4">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" /> {(story.ratingAvg || 4.8).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> {formatCompact(story.readsCount)} reads
                  </span>
                  <span>
                    {readerChapters.length} {readerChapters.length === 1 ? "chapter" : "chapters"}
                  </span>
                  {!session && lockedPages > 0 && (
                    <span className="text-[var(--color-muted)]">
                      Free preview · first {FREE_PREVIEW_PAGE_COUNT} pages
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <article id="reader-page-top" className="container-page mt-6 scroll-mt-24 sm:mt-12 sm:scroll-mt-28">
          <div className="mx-auto max-w-2xl">
            <StoryReaderUnlock />
            <ReaderScrollReset page={globalPage} />

            <ChapterNav
              slug={story.slug}
              chapters={readerChapters}
              currentChapterOrder={chapterOrder}
              maxAccessibleGlobalPage={maxAccessibleGlobalPage}
              isLoggedIn={isLoggedIn}
            />

            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-white/5 px-4 py-3 text-sm sm:mb-6">
              <span className="font-medium text-[var(--color-foreground)]">
                {currentChapter.title} · Page {pageInChapter} of {currentChapter.pageCount}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                Overall {globalPage} / {totalPages}
                {!isLoggedIn && lockedPages > 0 ? ` · preview ${maxAccessibleGlobalPage}` : ""}
              </span>
            </div>

            {globalPage === 1 && (
              <p className="text-base font-medium leading-relaxed text-[var(--color-foreground)] sm:text-lg">
                {story.excerpt}
              </p>
            )}

            <div className="prose-reader mt-4 whitespace-pre-wrap text-[var(--color-foreground)]/85 sm:mt-6">
              {pageContent || (
                <p className="text-[var(--color-muted)]">This page has no content yet.</p>
              )}
            </div>

            <StoryPager
              slug={story.slug}
              chapters={readerChapters}
              currentChapterOrder={chapterOrder}
              currentPageInChapter={pageInChapter}
              totalPages={totalPages}
              maxAccessibleGlobalPage={maxAccessibleGlobalPage}
              freePreviewCount={FREE_PREVIEW_PAGE_COUNT}
              isLoggedIn={isLoggedIn}
            />

            {showSignInGate && (
              <div id="sign-in-gate" className="scroll-mt-24">
                <SignInGate
                  slug={story.slug}
                  title={story.title}
                  lockedRemaining={lockedPages}
                  unit="pages"
                  nextChapterOrder={nextLockedPos?.chapter.order ?? chapterOrder}
                  nextPageInChapter={nextLockedPos?.pageInChapter ?? pageInChapter + 1}
                />
              </div>
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

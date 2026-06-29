import "server-only";

import { prisma } from "@/lib/prisma";
import { countStoryPages, splitStoryIntoPages, splitStoryParagraphs, WORDS_PER_PAGE } from "@/lib/reader-pages";
import type { Story } from "@/types/content";

export { countStoryPages, splitStoryIntoPages, splitStoryParagraphs, WORDS_PER_PAGE };

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80";

export type DbStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  readsCount: number;
  ratingAvg: number;
  featured: boolean;
  pageCount: number;
  genre: { name: string } | null;
  author: { profile: { displayName: string } | null } | null;
};

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  readsCount: true,
  ratingAvg: true,
  featured: true,
  pageCount: true,
  genre: { select: { name: true } },
  author: { select: { profile: { select: { displayName: true } } } },
} as const;

export function toCardStory(s: DbStory): Story {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    author: s.author?.profile?.displayName ?? "Ravi Ranjan",
    genre: s.genre?.name ?? "Story",
    cover: s.coverUrl || FALLBACK_COVER,
    rating: s.ratingAvg || 4.8,
    reads: s.readsCount,
    pageCount: Math.max(s.pageCount, 1),
    chapters: Math.max(s.pageCount, 1),
    excerpt: s.excerpt,
    trending: s.featured,
  };
}

export async function getLatestStories(take = 4): Promise<Story[]> {
  const rows = await prisma.story.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take,
    select: cardSelect,
  });
  return rows.map(toCardStory);
}

export async function getPopularStories(take = 4): Promise<Story[]> {
  const rows = await prisma.story.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { readsCount: "desc" },
    take,
    select: cardSelect,
  });
  return rows.map(toCardStory);
}

/** Up to `take` published stories for the hero floating cards (featured first, then latest). */
export async function getHeroStories(take = 4): Promise<Story[]> {
  const featured = await prisma.story.findMany({
    where: { status: "PUBLISHED", deletedAt: null, featured: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: cardSelect,
  });

  if (featured.length >= take) return featured.map(toCardStory);

  const featuredIds = featured.map((s) => s.id);
  const rest = await prisma.story.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      ...(featuredIds.length > 0 ? { id: { notIn: featuredIds } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: take - featured.length,
    select: cardSelect,
  });

  return [...featured, ...rest].map(toCardStory);
}

export async function getStoryBySlug(slug: string) {
  return prisma.story.findFirst({
    where: { slug, deletedAt: null },
    include: {
      genre: { select: { name: true } },
      author: { select: { profile: { select: { displayName: true, avatarUrl: true } } } },
    },
  });
}

export async function listAdminStories() {
  return prisma.story.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      readsCount: true,
      coverUrl: true,
      createdAt: true,
    },
  });
}

/** Free pages shown before sign-in is required. */
export const FREE_PREVIEW_PAGE_COUNT = 5;

/** Legacy paragraph preview count (kept for reference). */
export const FREE_PREVIEW_PARAGRAPH_COUNT = 2;

export function getVisiblePageCount(totalPages: number, isLoggedIn: boolean): number {
  if (totalPages === 0) return 0;
  if (isLoggedIn) return totalPages;
  return Math.min(FREE_PREVIEW_PAGE_COUNT, totalPages);
}

export function getVisibleParagraphCount(
  paragraphCount: number,
  hasFullAccess: boolean,
): number {
  if (hasFullAccess) return paragraphCount;
  return Math.min(FREE_PREVIEW_PARAGRAPH_COUNT, paragraphCount);
}

const STORIES_PAGE_SIZE = 12;

export async function getPublishedStoriesPaginated(page: number, pageSize = STORIES_PAGE_SIZE) {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.story.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.story.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      select: cardSelect,
    }),
  ]);

  return {
    stories: rows.map(toCardStory),
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** One-time helper: derive pageCount from story content for existing rows. */
export async function backfillStoryPageCounts() {
  const stories = await prisma.story.findMany({
    where: { deletedAt: null },
    select: { id: true, content: true },
  });

  for (const story of stories) {
    await prisma.story.update({
      where: { id: story.id },
      data: { pageCount: countStoryPages(story.content) },
    });
  }

  return stories.length;
}

import "server-only";

import { prisma } from "@/lib/prisma";
import type { Story } from "@/types/content";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80";

type DbStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  priceCents: number;
  readsCount: number;
  ratingAvg: number;
  featured: boolean;
  genre: { name: string } | null;
  author: { profile: { displayName: string } | null } | null;
};

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  priceCents: true,
  readsCount: true,
  ratingAvg: true,
  featured: true,
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
    chapters: 1,
    excerpt: s.excerpt,
    priceCents: s.priceCents,
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
      priceCents: true,
      readsCount: true,
      coverUrl: true,
      createdAt: true,
    },
  });
}

/** Whether the signed-in user can read the full story (free, owner/admin, or purchased). */
export async function userHasAccess(
  userId: string | null,
  story: { id: string; priceCents: number; authorId: string },
  role?: string,
): Promise<boolean> {
  if (!userId) return false;
  if (story.priceCents <= 0) return true;
  if (userId === story.authorId || role === "ADMIN" || role === "EDITOR") return true;
  const purchase = await prisma.purchase.findUnique({
    where: { userId_storyId: { userId, storyId: story.id } },
  });
  return Boolean(purchase);
}

/** Free paragraphs shown before sign-in or payment. */
export const FREE_PREVIEW_PARAGRAPH_COUNT = 2;

export function splitStoryParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function getVisibleParagraphCount(
  paragraphCount: number,
  hasFullAccess: boolean,
): number {
  if (hasFullAccess) return paragraphCount;
  return Math.min(FREE_PREVIEW_PARAGRAPH_COUNT, paragraphCount);
}

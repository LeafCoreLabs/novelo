import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getHeroShayari } from "@/lib/shayari";
import { toCardStory, type DbStory } from "@/services/story.service";
import { getLiveTestimonials } from "@/services/review.service";
import type { LandingContent, NavItem } from "@/types/content";

/** How many shuffled shayari to surface in the hero per page load. */
const HERO_SHAYARI_COUNT = 12;

/**
 * Landing page content — story rails and stats from the database; marketing copy
 * (hero, about, FAQ, etc.) from the structured source below.
 */
const content: LandingContent = {
  brand: { name: "Novelo", tagline: "Read between the worlds." },
  nav: [
    { label: "Latest", href: "#latest" },
    { label: "Library", href: "#popular" },
    { label: "Genres", href: "#categories" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
  ],
  hero: {
    eyebrow: "Novelo · a personal story library",
    titleLines: ["Where midnight", "meets mohabbat."],
    subtitle: "",
    primaryCta: { label: "Read the latest", href: "#latest" },
    secondaryCta: { label: "Sign up", href: "/signup" },
    featuredStories: [],
    snippets: [],
  },
  trending: [],
  popular: [],
  about: {
    name: "Ravi Ranjan",
    penName: "@raviranjan",
    role: "Indian Story Writer",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
    portrait: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=900&q=80",
    bioLong:
      "I'm Ravi Ranjan — an Indian story writer who has spent years crafting serialized fiction rooted in character, culture, and wonder. From sweeping fantasy to quiet sci-fi, everything on Novelo is written and published by me, updated weekly. Start reading for free — sign in to continue past the first five pages.",
    highlights: [
      "12 ongoing & completed stories",
      "New chapters every week",
      "Three-time Editor's Choice",
      "Over 1.2M chapters read",
    ],
    socials: [
      { label: "Twitter", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Newsletter", href: "#newsletter" },
    ],
  },
  categories: [] as LandingContent["categories"],
  stats: [
    { id: "s1", label: "Stories published", value: 0 },
    { id: "s2", label: "Chapters written", value: 0 },
    { id: "s3", label: "Total reads", value: 0 },
    { id: "s4", label: "Subscribers", value: 0 },
  ],
  testimonials: [],
  faqs: [
    {
      id: "f1",
      question: "Is it free to read?",
      answer:
        "Yes. Every story starts free, and most stay free to read in full. If you'd like to support my writing, you can subscribe or leave a tip — entirely optional.",
    },
    {
      id: "f2",
      question: "How often do new chapters come out?",
      answer:
        "I publish new chapters every week, usually on the same day. Subscribe to the newsletter and you'll get an email the moment a new chapter goes live.",
    },
    {
      id: "f3",
      question: "Can I pick up where I left off?",
      answer:
        "Yes — create a free account and your reading progress, bookmarks, and library sync across all your devices automatically.",
    },
    {
      id: "f4",
      question: "Can I read offline?",
      answer:
        "The site works as a PWA with offline reading. Bookmark a story and your saved chapters are available even without a connection.",
    },
  ],
  newsletter: {
    title: "Never miss a new chapter.",
    subtitle:
      "Subscribe and I'll email you the moment a new chapter goes live — plus the occasional behind-the-scenes note. No spam, unsubscribe anytime.",
  },
};

/** Static nav/brand for layouts — no database round-trip. */
export const STATIC_BRAND = content.brand;
export const STATIC_NAV: NavItem[] = content.nav;

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

function pickHeroStories(rows: DbStory[]) {
  const featured = rows.filter((s) => s.featured);
  const rest = rows.filter((s) => !s.featured);
  return [...featured, ...rest].slice(0, 4).map(toCardStory);
}

function pickPopularStories(rows: DbStory[]) {
  return [...rows].sort((a, b) => b.readsCount - a.readsCount).slice(0, 4).map(toCardStory);
}

const GENRE_META: Record<string, { icon: string; accent: string }> = {
  Fantasy: { icon: "Sparkles", accent: "from-rose-500 to-fuchsia-500" },
  "Science Fiction": { icon: "Rocket", accent: "from-orange-500 to-rose-500" },
  Romance: { icon: "Heart", accent: "from-pink-500 to-rose-400" },
  Mystery: { icon: "Search", accent: "from-amber-500 to-orange-400" },
  Thriller: { icon: "Zap", accent: "from-red-500 to-rose-500" },
  Literary: { icon: "BookOpen", accent: "from-fuchsia-500 to-pink-400" },
  Horror: { icon: "Ghost", accent: "from-rose-600 to-red-500" },
  Adventure: { icon: "Compass", accent: "from-orange-400 to-amber-400" },
};

async function getCategoryCounts() {
  const rows = await prisma.story.groupBy({
    by: ["genreId"],
    where: { status: "PUBLISHED", deletedAt: null, genreId: { not: null } },
    _count: { id: true },
  });

  const genreIds = rows.map((r) => r.genreId).filter(Boolean) as string[];
  if (genreIds.length === 0) {
    const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
    return genres.map((g) => ({
      id: g.id,
      name: g.name,
      icon: GENRE_META[g.name]?.icon ?? "Sparkles",
      accent: GENRE_META[g.name]?.accent ?? "from-rose-500 to-fuchsia-500",
      count: 0,
    }));
  }

  const genres = await prisma.genre.findMany({
    where: { id: { in: genreIds } },
    orderBy: { name: "asc" },
  });
  const countMap = new Map(rows.map((r) => [r.genreId, r._count.id]));

  return genres.map((g) => ({
    id: g.id,
    name: g.name,
    icon: GENRE_META[g.name]?.icon ?? "Sparkles",
    accent: GENRE_META[g.name]?.accent ?? "from-rose-500 to-fuchsia-500",
    count: countMap.get(g.id) ?? 0,
  }));
}

async function fetchLandingContent(): Promise<LandingContent> {
  try {
    const [publishedStories, testimonials, categories, storyCount, readsAgg, chapterCount, subscriberCount] =
      await Promise.all([
        prisma.story.findMany({
          where: { status: "PUBLISHED", deletedAt: null },
          orderBy: { publishedAt: "desc" },
          take: 24,
          select: cardSelect,
        }),
        getLiveTestimonials(3),
        getCategoryCounts(),
        prisma.story.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        prisma.story.aggregate({
          where: { deletedAt: null },
          _sum: { readsCount: true },
        }),
        prisma.chapter.count({ where: { deletedAt: null } }),
        prisma.newsletterSubscriber.count(),
      ]);

    const latest = publishedStories.slice(0, 4).map(toCardStory);

    return {
      ...content,
      hero: {
        ...content.hero,
        featuredStories: pickHeroStories(publishedStories),
        snippets: getHeroShayari(HERO_SHAYARI_COUNT),
      },
      trending: latest,
      popular: pickPopularStories(publishedStories),
      testimonials,
      categories,
      stats: [
        { id: "s1", label: "Stories published", value: storyCount },
        { id: "s2", label: "Chapters written", value: chapterCount },
        {
          id: "s3",
          label: "Total reads",
          value: readsAgg._sum.readsCount ?? 0,
        },
        { id: "s4", label: "Subscribers", value: subscriberCount },
      ],
    };
  } catch {
    return { ...content, hero: { ...content.hero, snippets: getHeroShayari(HERO_SHAYARI_COUNT) } };
  }
}

/** Cached landing payload — avoids repeated cross-region DB hits on every request. */
export const getLandingContent = unstable_cache(fetchLandingContent, ["novelo-landing"], {
  revalidate: 60,
  tags: ["landing"],
});

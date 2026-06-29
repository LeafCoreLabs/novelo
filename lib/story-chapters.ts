import { countStoryPages, splitStoryIntoPages } from "@/lib/reader-pages";

export type ChapterInput = {
  id?: string;
  title: string;
  content: string;
  order: number;
};

export type ReaderChapter = {
  id: string;
  order: number;
  title: string;
  pages: string[];
  pageCount: number;
  globalStartPage: number;
};

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function mergeChapterContent(chapters: { content: string }[]): string {
  return chapters
    .map((c) => c.content.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function buildReaderChapters(
  chapters: { id: string; order: number; title: string; content: string }[],
): ReaderChapter[] {
  const sorted = [...chapters].sort((a, b) => a.order - b.order);
  let globalStart = 1;

  return sorted.map((chapter) => {
    const pages = splitStoryIntoPages(chapter.content);
    const pageCount = Math.max(pages.length, 1);
    const readerChapter: ReaderChapter = {
      id: chapter.id,
      order: chapter.order,
      title: chapter.title,
      pages: pages.length > 0 ? pages : [""],
      pageCount,
      globalStartPage: globalStart,
    };
    globalStart += pageCount;
    return readerChapter;
  });
}

export function totalReaderPages(readerChapters: ReaderChapter[]): number {
  if (readerChapters.length === 0) return 1;
  const last = readerChapters[readerChapters.length - 1]!;
  return last.globalStartPage + last.pageCount - 1;
}

export function globalPageToChapterPosition(
  readerChapters: ReaderChapter[],
  globalPage: number,
): { chapter: ReaderChapter; pageInChapter: number } | null {
  for (const chapter of readerChapters) {
    const end = chapter.globalStartPage + chapter.pageCount - 1;
    if (globalPage >= chapter.globalStartPage && globalPage <= end) {
      return { chapter, pageInChapter: globalPage - chapter.globalStartPage + 1 };
    }
  }
  return null;
}

export function chapterPositionToGlobalPage(
  readerChapters: ReaderChapter[],
  chapterOrder: number,
  pageInChapter: number,
): number | null {
  const chapter = readerChapters.find((c) => c.order === chapterOrder);
  if (!chapter) return null;
  if (pageInChapter < 1 || pageInChapter > chapter.pageCount) return null;
  return chapter.globalStartPage + pageInChapter - 1;
}

export function storyUrl(
  slug: string,
  chapterOrder: number,
  pageInChapter: number,
): string {
  return `/story/${slug}?chapter=${chapterOrder}&page=${pageInChapter}`;
}

export function countStoryPagesFromChapters(chapters: { content: string }[]): number {
  const merged = mergeChapterContent(chapters);
  return countStoryPages(merged || " ");
}

export function parseChaptersJson(raw: string | null): ChapterInput[] {
  if (!raw?.trim()) return [{ title: "Chapter 1", content: "", order: 1 }];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [{ title: "Chapter 1", content: "", order: 1 }];
    }

    return parsed.map((item, index) => {
      const row = item as Record<string, unknown>;
      return {
        id: typeof row.id === "string" ? row.id : undefined,
        title: String(row.title ?? `Chapter ${index + 1}`).trim() || `Chapter ${index + 1}`,
        content: String(row.content ?? ""),
        order: index + 1,
      };
    });
  } catch {
    return [{ title: "Chapter 1", content: "", order: 1 }];
  }
}

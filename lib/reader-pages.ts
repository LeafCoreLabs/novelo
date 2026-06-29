/** Approximate words per reader page (shared by server + client). */
export const WORDS_PER_PAGE = 280;

export function splitStoryParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Split story body into paginated chunks for the reader UI. */
export function splitStoryIntoPages(content: string): string[] {
  const paragraphs = splitStoryParagraphs(content);
  if (paragraphs.length === 0) return [];

  const pages: string[] = [];
  let chunk: string[] = [];
  let words = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).filter(Boolean).length;
    if (chunk.length > 0 && words + paragraphWords > WORDS_PER_PAGE) {
      pages.push(chunk.join("\n\n"));
      chunk = [paragraph];
      words = paragraphWords;
    } else {
      chunk.push(paragraph);
      words += paragraphWords;
    }
  }

  if (chunk.length > 0) {
    pages.push(chunk.join("\n\n"));
  }

  return pages;
}

export function countStoryPages(content: string): number {
  return Math.max(splitStoryIntoPages(content).length, 1);
}

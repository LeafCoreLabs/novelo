/** Approximate words per reader page (shared by server + client). */
export const WORDS_PER_PAGE = 200;

export function splitStoryParagraphs(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  let paragraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Single newlines when authors paste without blank lines between paragraphs.
  if (paragraphs.length <= 1 && trimmed.includes("\n")) {
    paragraphs = trimmed
      .split(/\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return paragraphs.length > 0 ? paragraphs : [trimmed];
}

function splitLongParagraph(paragraph: string, maxWords: number): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= maxWords) return [paragraph];

  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
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

    if (paragraphWords > WORDS_PER_PAGE) {
      if (chunk.length > 0) {
        pages.push(chunk.join("\n\n"));
        chunk = [];
        words = 0;
      }
      pages.push(...splitLongParagraph(paragraph, WORDS_PER_PAGE));
      continue;
    }

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

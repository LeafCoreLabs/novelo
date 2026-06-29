"use client";

import { Plus, Trash2 } from "lucide-react";

import { Field } from "@/components/admin/story-form/field";
import { countStoryPagesFromChapters } from "@/lib/story-chapters";
import type { ChapterInput } from "@/lib/story-chapters";

export function ChaptersEditor({
  chapters,
  onChange,
}: {
  chapters: ChapterInput[];
  onChange: (chapters: ChapterInput[]) => void;
}) {
  const totalPages = countStoryPagesFromChapters(chapters);

  function updateChapter(index: number, patch: Partial<ChapterInput>) {
    onChange(chapters.map((ch, i) => (i === index ? { ...ch, ...patch } : ch)));
  }

  function addChapter() {
    onChange([
      ...chapters,
      { title: `Chapter ${chapters.length + 1}`, content: "", order: chapters.length + 1 },
    ]);
  }

  function removeChapter(index: number) {
    if (chapters.length <= 1) return;
    onChange(
      chapters
        .filter((_, i) => i !== index)
        .map((ch, i) => ({ ...ch, order: i + 1 })),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Chapters</p>
          <p className="text-xs text-[var(--color-muted)]">
            {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"} · ~{totalPages}{" "}
            reader pages total
          </p>
        </div>
        <button
          type="button"
          onClick={addChapter}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-white/5"
        >
          <Plus className="h-3.5 w-3.5" /> Add chapter
        </button>
      </div>

      {chapters.map((chapter, index) => (
        <div
          key={chapter.id ?? `new-${index}`}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white/[0.03] p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
              Chapter {index + 1}
            </span>
            {chapters.length > 1 && (
              <button
                type="button"
                onClick={() => removeChapter(index)}
                className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>

          <Field label="Chapter title">
            <input
              value={chapter.title}
              onChange={(e) => updateChapter(index, { title: e.target.value })}
              placeholder={`Chapter ${index + 1}`}
              className="glass h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </Field>

          <div className="mt-3">
            <Field label="Chapter content">
              <textarea
                value={chapter.content}
                onChange={(e) => updateChapter(index, { content: e.target.value })}
                rows={10}
                placeholder="Write this chapter. Separate paragraphs with blank lines."
                className="glass min-h-[220px] w-full rounded-xl px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

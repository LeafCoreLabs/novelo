"use client";

import { countStoryPages } from "@/lib/reader-pages";

import { Field } from "@/components/admin/story-form/field";

export function StoryContentField({
  content,
  onContentChange,
}: {
  content: string;
  onContentChange: (value: string) => void;
}) {
  const pageCount = countStoryPages(content);

  return (
    <Field label="Story">
      <textarea
        name="content"
        required
        rows={14}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Write your story here. Separate paragraphs with blank lines."
        className="glass min-h-[280px] w-full rounded-xl px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--color-primary)] md:min-h-[320px]"
      />
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Estimated reader length:{" "}
        <span className="font-medium text-[var(--color-foreground)]">
          {pageCount} {pageCount === 1 ? "page" : "pages"}
        </span>
      </p>
    </Field>
  );
}

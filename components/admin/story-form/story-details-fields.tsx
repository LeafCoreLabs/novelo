import { Field } from "@/components/admin/story-form/field";

export function StoryDetailsFields({
  defaultTitle = "",
  defaultExcerpt = "",
}: {
  defaultTitle?: string;
  defaultExcerpt?: string;
}) {
  return (
    <>
      <Field label="Title">
        <input
          name="title"
          required
          defaultValue={defaultTitle}
          placeholder="The Cartographer of Lost Cities"
          className="glass h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>

      <Field label="Teaser (shown on page 1)">
        <textarea
          name="excerpt"
          required
          rows={3}
          defaultValue={defaultExcerpt}
          placeholder="One or two lines that hook the reader…"
          className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>
    </>
  );
}

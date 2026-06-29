import { Field } from "@/components/admin/story-form/field";

export function StoryDetailsFields() {
  return (
    <>
      <Field label="Title">
        <input
          name="title"
          required
          placeholder="The Cartographer of Lost Cities"
          className="glass h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>

      <Field label="Teaser (shown free, before the paywall)">
        <textarea
          name="excerpt"
          required
          rows={3}
          placeholder="One or two lines that hook the reader…"
          className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>
    </>
  );
}

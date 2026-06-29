import { Field } from "@/components/admin/story-form/field";

export function StoryMetaFields({
  genres,
  defaultGenreId = "",
}: {
  genres: { id: string; name: string }[];
  defaultGenreId?: string;
}) {
  return (
    <Field label="Genre">
      <select
        name="genreId"
        defaultValue={defaultGenreId}
        className="glass h-11 w-full rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        <option value="">No genre</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id} className="bg-[var(--color-surface)]">
            {g.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

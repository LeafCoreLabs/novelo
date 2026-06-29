import { Field } from "@/components/admin/story-form/field";

export function StoryMetaFields({ genres }: { genres: { id: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Genre">
        <select
          name="genreId"
          defaultValue=""
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

      <Field label="Price (USD) — 0 for free">
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue="0"
          className="glass h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>
    </div>
  );
}

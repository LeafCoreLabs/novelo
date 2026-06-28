"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { createStoryAction, type StoryFormState } from "@/actions/story";
import { Button } from "@/components/ui/button";

const initial: StoryFormState = {};

export function StoryForm({ genres }: { genres: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createStoryAction, initial);
  const [coverUrl, setCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Thumbnail */}
      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-foreground)]/80">Thumbnail</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--color-border)] bg-white/5 text-[var(--color-muted)] transition-colors hover:bg-white/10"
          >
            {coverUrl ? (
              <Image src={coverUrl} alt="cover" fill sizes="128px" className="object-cover" />
            ) : uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="h-6 w-6" />
                Upload
              </span>
            )}
          </button>
          <div className="flex-1 space-y-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="…or paste an image URL"
              className="glass h-10 w-full rounded-xl px-3 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            {uploadError && <p className="text-xs text-red-300">{uploadError}</p>}
            <p className="text-xs text-[var(--color-muted)]">PNG, JPG, WEBP up to 8MB.</p>
          </div>
        </div>
        <input type="hidden" name="coverUrl" value={coverUrl} />
      </div>

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
          rows={2}
          placeholder="One or two lines that hook the reader…"
          className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>

      <Field label="Story">
        <textarea
          name="content"
          required
          rows={12}
          placeholder="Write your story here. Separate paragraphs with blank lines."
          className="glass w-full rounded-xl px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </Field>

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

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="publish"
          defaultChecked
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        Publish now (uncheck to save as draft)
      </label>

      <label className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
        <input
          type="checkbox"
          name="agreeWriterTerms"
          required
          className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-[var(--color-accent)] hover:underline">
            writer terms
          </Link>{" "}
          and confirm I have the rights to publish this story.
        </span>
      </label>

      {state?.error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? "Publishing…" : "Publish story"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[var(--color-foreground)]/80">{label}</span>
      {children}
    </label>
  );
}

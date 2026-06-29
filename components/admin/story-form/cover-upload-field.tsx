"use client";

import { Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { Field } from "@/components/admin/story-form/field";

export function CoverUploadField({
  coverUrl,
  uploading,
  uploadError,
  onCoverUrlChange,
  onFile,
}: {
  coverUrl: string;
  uploading: boolean;
  uploadError: string;
  onCoverUrlChange: (url: string) => void;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Field label="Thumbnail">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative mx-auto flex h-48 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--color-border)] bg-white/5 text-[var(--color-muted)] transition-colors hover:bg-white/10 sm:mx-0"
        >
          {coverUrl ? (
            <Image src={coverUrl} alt="cover" fill sizes="144px" className="object-cover" />
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
            onChange={(e) => onCoverUrlChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="glass h-11 w-full rounded-xl px-3 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          {uploadError && <p className="text-xs text-red-300">{uploadError}</p>}
          <p className="text-xs text-[var(--color-muted)]">PNG, JPG, WEBP up to 8MB.</p>
        </div>
      </div>
    </Field>
  );
}

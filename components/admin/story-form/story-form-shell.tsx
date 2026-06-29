"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import { createStoryAction, updateStoryAction, type StoryFormState } from "@/actions/story";
import { ChaptersEditor } from "@/components/admin/story-form/chapters-editor";
import { CoverUploadField } from "@/components/admin/story-form/cover-upload-field";
import {
  COVER_STORAGE_KEY,
  FORM_STEPS,
  PUBLISHED_AT_KEY,
  PUBLISHED_SLUG_KEY,
} from "@/components/admin/story-form/constants";
import { StoryDetailsFields } from "@/components/admin/story-form/story-details-fields";
import { StoryFormStepper } from "@/components/admin/story-form/story-form-stepper";
import { StoryPublishPanel } from "@/components/admin/story-form/story-publish-panel";
import { Button } from "@/components/ui/button";
import type { ChapterInput } from "@/lib/story-chapters";
import { cn } from "@/lib/utils";

const initial: StoryFormState = {};

export type StoryFormInitial = {
  storyId: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  genreId: string | null;
  published: boolean;
  chapters: ChapterInput[];
};

function stepSectionClass(step: number, activeStep: number) {
  return cn(activeStep !== step && "hidden", "md:block");
}

export function StoryFormShell({
  genres,
  initialStory,
}: {
  genres: { id: string; name: string }[];
  initialStory?: StoryFormInitial;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialStory);
  const action = isEdit ? updateStoryAction : createStoryAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [coverUrl, setCoverUrl] = useState(initialStory?.coverUrl ?? "");
  const [chapters, setChapters] = useState<ChapterInput[]>(
    initialStory?.chapters ?? [{ title: "Chapter 1", content: "", order: 1 }],
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [step, setStep] = useState(0);
  const [publishedRecently, setPublishedRecently] = useState(false);

  const chaptersJson = useMemo(() => JSON.stringify(chapters), [chapters]);

  useEffect(() => {
    if (isEdit) return;

    const storedCover = sessionStorage.getItem(COVER_STORAGE_KEY);
    if (storedCover) setCoverUrl(storedCover);

    const slug = sessionStorage.getItem(PUBLISHED_SLUG_KEY);
    const publishedAt = Number(sessionStorage.getItem(PUBLISHED_AT_KEY) ?? 0);
    if (slug && publishedAt && Date.now() - publishedAt < 5 * 60_000) {
      setPublishedRecently(true);
      router.replace("/admin");
    }
  }, [isEdit, router]);

  function updateCoverUrl(url: string) {
    setCoverUrl(url);
    if (isEdit) return;
    if (url) sessionStorage.setItem(COVER_STORAGE_KEY, url);
    else sessionStorage.removeItem(COVER_STORAGE_KEY);
  }

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
      updateCoverUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const lastStep = FORM_STEPS.length - 1;
  const submitLabel = isEdit
    ? pending
      ? "Saving…"
      : "Save changes"
    : pending
      ? "Publishing…"
      : "Publish story";

  const panelProps = {
    genres,
    error: state?.error,
    pending,
    uploading,
    publishedRecently,
    isEdit,
    defaultGenreId: initialStory?.genreId ?? "",
    defaultPublished: initialStory?.published ?? true,
  };

  return (
    <form action={formAction} className="space-y-6 pb-28 md:pb-0">
      {isEdit && initialStory ? (
        <input type="hidden" name="storyId" value={initialStory.storyId} />
      ) : null}
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="chaptersJson" value={chaptersJson} readOnly />

      <StoryFormStepper step={step} onStep={setStep} />

      <div className={stepSectionClass(0, step)}>
        <CoverUploadField
          coverUrl={coverUrl}
          uploading={uploading}
          uploadError={uploadError}
          onCoverUrlChange={updateCoverUrl}
          onFile={onFile}
        />
      </div>

      <div className={stepSectionClass(1, step)}>
        <StoryDetailsFields
          defaultTitle={initialStory?.title}
          defaultExcerpt={initialStory?.excerpt}
        />
      </div>

      <div className={stepSectionClass(2, step)}>
        <ChaptersEditor chapters={chapters} onChange={setChapters} />
      </div>

      <div className={stepSectionClass(3, step)}>
        <StoryPublishPanel {...panelProps} showDesktopSubmit />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          {step > 0 && (
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < lastStep ? (
            <Button type="button" className="flex-1" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1"
              disabled={pending || uploading || publishedRecently}
            >
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

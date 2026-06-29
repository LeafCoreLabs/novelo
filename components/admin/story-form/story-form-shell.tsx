"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { createStoryAction, type StoryFormState } from "@/actions/story";
import { CoverUploadField } from "@/components/admin/story-form/cover-upload-field";
import {
  COVER_STORAGE_KEY,
  FORM_STEPS,
  PUBLISHED_AT_KEY,
  PUBLISHED_SLUG_KEY,
} from "@/components/admin/story-form/constants";
import { StoryContentField } from "@/components/admin/story-form/story-content-field";
import { StoryDetailsFields } from "@/components/admin/story-form/story-details-fields";
import { StoryFormStepper } from "@/components/admin/story-form/story-form-stepper";
import { StoryPublishPanel } from "@/components/admin/story-form/story-publish-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: StoryFormState = {};

export function StoryFormShell({ genres }: { genres: { id: string; name: string }[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createStoryAction, initial);
  const [coverUrl, setCoverUrl] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [step, setStep] = useState(0);
  const [publishedRecently, setPublishedRecently] = useState(false);

  useEffect(() => {
    const storedCover = sessionStorage.getItem(COVER_STORAGE_KEY);
    if (storedCover) setCoverUrl(storedCover);

    const slug = sessionStorage.getItem(PUBLISHED_SLUG_KEY);
    const publishedAt = Number(sessionStorage.getItem(PUBLISHED_AT_KEY) ?? 0);
    if (slug && publishedAt && Date.now() - publishedAt < 5 * 60_000) {
      setPublishedRecently(true);
      router.replace("/admin");
    }
  }, [router]);

  function updateCoverUrl(url: string) {
    setCoverUrl(url);
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

  function nextStep() {
    setStep((s) => Math.min(s + 1, lastStep));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const panelProps = {
    genres,
    error: state?.error,
    pending,
    uploading,
    publishedRecently,
  };

  return (
    <form action={formAction} className="space-y-6 pb-28 md:pb-0">
      <StoryFormStepper step={step} onStep={setStep} />

      {/* Mobile: all fields stay mounted; only the active step is visible */}
      <div className="space-y-6 md:hidden">
        <div className={cn(step !== 0 && "hidden")}>
          <CoverUploadField
            coverUrl={coverUrl}
            uploading={uploading}
            uploadError={uploadError}
            onCoverUrlChange={updateCoverUrl}
            onFile={onFile}
          />
        </div>
        <div className={cn(step !== 1 && "hidden")}>
          <StoryDetailsFields />
        </div>
        <div className={cn(step !== 2 && "hidden")}>
          <StoryContentField content={content} onContentChange={setContent} />
        </div>
        <div className={cn(step !== 3 && "hidden")}>
          <StoryPublishPanel {...panelProps} showDesktopSubmit={false} />
        </div>
      </div>

      {/* Desktop: full form */}
      <div className="hidden space-y-6 md:block">
        <CoverUploadField
          coverUrl={coverUrl}
          uploading={uploading}
          uploadError={uploadError}
          onCoverUrlChange={updateCoverUrl}
          onFile={onFile}
        />
        <StoryDetailsFields />
        <StoryContentField content={content} onContentChange={setContent} />
        <StoryPublishPanel {...panelProps} />
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          {step > 0 && (
            <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < lastStep ? (
            <Button type="button" className="flex-1" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1"
              disabled={pending || uploading || publishedRecently}
            >
              {pending ? "Publishing…" : "Publish story"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

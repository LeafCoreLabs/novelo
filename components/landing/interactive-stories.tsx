"use client";

import { HomeInteractiveProvider, useHomeInteractive } from "@/components/landing/home-interactive-provider";
import { StoryPreviewModal } from "@/components/landing/story-preview-modal";
import { useCallback } from "react";
import type { Category, Story } from "@/types/content";

function PreviewModalHost() {
  const { previewStory, setPreviewStory } = useHomeInteractive();
  const onClose = useCallback(() => setPreviewStory(null), [setPreviewStory]);
  return <StoryPreviewModal story={previewStory} onClose={onClose} />;
}

export function HomeInteractiveShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HomeInteractiveProvider>
      {children}
      <PreviewModalHost />
    </HomeInteractiveProvider>
  );
}

export { useHomeInteractive };

export type { Story, Category };

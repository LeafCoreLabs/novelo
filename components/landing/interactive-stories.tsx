"use client";

import { HomeInteractiveProvider, useHomeInteractive } from "@/components/landing/home-interactive-provider";
import { StoryPreviewModal } from "@/components/landing/story-preview-modal";
import type { Category, Story } from "@/types/content";

function PreviewModalHost() {
  const { previewStory, setPreviewStory } = useHomeInteractive();
  return <StoryPreviewModal story={previewStory} onClose={() => setPreviewStory(null)} />;
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

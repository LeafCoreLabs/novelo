"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { Story } from "@/types/content";

interface HomeInteractiveContextValue {
  selectedGenre: string | null;
  setSelectedGenre: (genre: string | null) => void;
  toggleGenre: (genre: string) => void;
  previewStory: Story | null;
  setPreviewStory: (story: Story | null) => void;
  filterStories: (stories: Story[]) => Story[];
}

const HomeInteractiveContext = createContext<HomeInteractiveContextValue | null>(null);

export function HomeInteractiveProvider({ children }: { children: ReactNode }) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [previewStory, setPreviewStory] = useState<Story | null>(null);

  const value = useMemo(
    () => ({
      selectedGenre,
      setSelectedGenre,
      toggleGenre: (genre: string) => {
        setSelectedGenre((prev) => (prev === genre ? null : genre));
      },
      previewStory,
      setPreviewStory,
      filterStories: (stories: Story[]) =>
        selectedGenre ? stories.filter((s) => s.genre === selectedGenre) : stories,
    }),
    [selectedGenre, previewStory],
  );

  return (
    <HomeInteractiveContext.Provider value={value}>{children}</HomeInteractiveContext.Provider>
  );
}

export function useHomeInteractive() {
  const ctx = useContext(HomeInteractiveContext);
  if (!ctx) throw new Error("useHomeInteractive must be used within HomeInteractiveProvider");
  return ctx;
}

/** Safe variant for story cards used outside the homepage provider (e.g. /stories). */
export function useHomeInteractiveOptional() {
  return useContext(HomeInteractiveContext);
}

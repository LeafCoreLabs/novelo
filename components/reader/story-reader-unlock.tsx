"use client";

import { useEffect } from "react";

import { clearScrollLocks } from "@/components/site/route-scroll-reset";

/** Ensures the story reader is scrollable on mount (clears stale homepage/modal locks). */
export function StoryReaderUnlock() {
  useEffect(() => {
    clearScrollLocks();
  }, []);

  return null;
}

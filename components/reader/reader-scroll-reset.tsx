"use client";

import { useEffect, useRef } from "react";

/** Scroll to the reader top when the page query changes (not on first mount). */
export function ReaderScrollReset({ page }: { page: number }) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    requestAnimationFrame(() => {
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const el = document.getElementById("reader-page-top");
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }, [page]);

  return null;
}

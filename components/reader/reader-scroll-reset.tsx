"use client";

import { useEffect } from "react";

/** Scroll to the reader top when the page query changes. */
export function ReaderScrollReset({ page }: { page: number }) {
  useEffect(() => {
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

"use client";

import { useEffect } from "react";

/** Scroll to the reader top when the page query changes. */
export function ReaderScrollReset({ page }: { page: number }) {
  useEffect(() => {
    const el = document.getElementById("reader-page-top");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  return null;
}

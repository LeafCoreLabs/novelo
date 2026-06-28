"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Lenis / modals / mobile nav can leave scroll locked after back/forward navigation. */
export function clearScrollLocks() {
  document.body.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overflow");
  document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
  document.body.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
}

/** Resets stale scroll locks whenever the App Router route changes or bfcache restores. */
export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    clearScrollLocks();
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) clearScrollLocks();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}

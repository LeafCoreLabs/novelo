"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type ClearScrollLockOptions = {
  /** Restore scroll position saved by lockBodyScroll (modal close only). */
  restoreScroll?: boolean;
};

/** Lenis / modals / mobile nav can leave scroll locked after navigation. */
export function clearScrollLocks(options: ClearScrollLockOptions = {}) {
  const { restoreScroll = false } = options;
  const scrollY = Number.parseInt(document.body.dataset.scrollLockY ?? "0", 10);

  for (const el of [document.body, document.documentElement]) {
    el.style.removeProperty("overflow");
    el.style.removeProperty("position");
    el.style.removeProperty("top");
    el.style.removeProperty("left");
    el.style.removeProperty("right");
    el.style.removeProperty("width");
    el.style.removeProperty("height");
    el.style.removeProperty("touch-action");
  }

  delete document.body.dataset.scrollLockY;

  document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
  document.body.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");

  if (restoreScroll && scrollY > 0) {
    window.scrollTo(0, scrollY);
  }
}

export function lockBodyScroll() {
  if (document.body.dataset.scrollLockY) return;

  const scrollY = window.scrollY;
  document.body.dataset.scrollLockY = String(scrollY);
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

export function unlockBodyScroll(restoreScroll = true) {
  clearScrollLocks({ restoreScroll });
}

function runScrollUnlock() {
  clearScrollLocks();
  document.body.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overflow");
}

/** Resets stale scroll locks whenever the App Router route changes or bfcache restores. */
export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    runScrollUnlock();
    const raf = requestAnimationFrame(runScrollUnlock);
    const timer = window.setTimeout(runScrollUnlock, 0);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) runScrollUnlock();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}

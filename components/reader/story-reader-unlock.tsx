"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { clearScrollLocks } from "@/components/site/route-scroll-reset";

/** Ensures the story reader is scrollable after client navigation (clears stale locks). */
export function StoryReaderUnlock() {
  const pathname = usePathname();

  useEffect(() => {
    const unlock = () => {
      clearScrollLocks();
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };

    unlock();
    const raf = requestAnimationFrame(unlock);
    const t1 = window.setTimeout(unlock, 0);
    const t2 = window.setTimeout(unlock, 100);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}

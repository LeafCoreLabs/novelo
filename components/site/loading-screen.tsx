"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookMarked } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { clearScrollLocks } from "@/components/site/route-scroll-reset";

const BRAND_TEXT =
  "Read between the worlds. Serialized fiction across fantasy, sci-fi, and everything in between — new chapters every week, free to start, and you'll never lose your place.";

const INTRO_DURATION = 600;
const INTRO_SEEN_KEY = "novelo_intro_seen";

/** Routes where the intro loader should not block interaction. */
const SKIP_LOADER_PREFIXES = [
  "/signup",
  "/login",
  "/admin",
  "/story",
  "/stories",
  "/terms",
  "/privacy",
];

function shouldSkipLoader(pathname: string) {
  return SKIP_LOADER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Branded intro / loading screen.
 *
 * Shows once per browser tab session on the homepage, then stays dismissed —
 * including when the user navigates away and uses the browser back button.
 */
export function LoadingScreen() {
  const pathname = usePathname();
  const skip = shouldSkipLoader(pathname);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (skip) {
      setVisible(false);
      setReady(true);
      return;
    }

    const seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    if (seen) {
      setVisible(false);
      setReady(true);
      return;
    }

    setVisible(true);
    setReady(true);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      setVisible(false);
    }, INTRO_DURATION);

    return () => window.clearTimeout(timer);
  }, [skip]);

  useEffect(() => {
    if (!ready) return;

    if (skip) {
      clearScrollLocks();
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [visible, ready, skip]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setVisible(false);
      clearScrollLocks();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  if (skip || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="Novelo-loader"
          role="status"
          aria-label="Loading Novelo"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          style={{
            background:
              "radial-gradient(110% 75% at 50% -10%, rgba(220,20,60,0.22), rgba(10,6,12,0.98) 60%, #08050a 100%)",
          }}
        >
          <motion.div
            exit={{ y: -28, opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
            className="flex w-full max-w-xl flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-glow)]"
              >
                <BookMarked className="h-7 w-7" />
              </motion.span>
              <span className="font-display text-4xl font-semibold tracking-tight">Novelo</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.25, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base"
            >
              {BRAND_TEXT}
            </motion.p>

            <div className="mt-9 h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTRO_DURATION / 1000, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #ff5f8f, #ff8a5c)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

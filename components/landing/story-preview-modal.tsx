"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Lock, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { clearScrollLocks } from "@/components/site/route-scroll-reset";
import { Button } from "@/components/ui/button";
import { formatCompact } from "@/lib/utils";
import type { Story } from "@/types/content";

function priceLabel(cents?: number) {
  if (!cents || cents <= 0) return "Free to read";
  return `$${(cents / 100).toFixed(2)} to unlock`;
}

export function StoryPreviewModal({
  story,
  onClose,
}: {
  story: Story | null;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!story) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      clearScrollLocks();
    };
  }, [story, onClose]);

  return (
    <AnimatePresence>
      {story && (
        <motion.div
          key={story.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${story.title}`}
        >
          <button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 grid w-full max-w-lg gap-6 overflow-hidden rounded-[var(--radius-xl)] p-6 sm:grid-cols-[140px_1fr]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative mx-auto aspect-[3/4] w-36 overflow-hidden rounded-2xl sm:mx-0 sm:w-full">
              <Image src={story.cover} alt={story.title} fill sizes="160px" className="object-cover" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {story.genre}
              </span>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">{story.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {story.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" /> {story.rating.toFixed(1)}
                </span>
                <span>{formatCompact(story.reads)} reads</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {Math.max(story.pageCount ?? story.chapters ?? 1, 1)}{" "}
                  {Math.max(story.pageCount ?? story.chapters ?? 1, 1) === 1 ? "page" : "pages"}
                </span>
                <span
                  className={
                    story.priceCents && story.priceCents > 0
                      ? "flex items-center gap-1 text-[var(--color-accent)]"
                      : "text-emerald-400"
                  }
                >
                  {story.priceCents && story.priceCents > 0 && <Lock className="h-3 w-3" />}
                  {priceLabel(story.priceCents)}
                </span>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {story.slug && (
                  <Link href={`/story/${story.slug}`} className="flex-1">
                    <Button size="lg" className="group w-full">
                      Read preview
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

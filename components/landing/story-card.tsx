"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BookOpen, ExternalLink, Flame, Lock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useHomeInteractiveOptional } from "@/components/landing/home-interactive-provider";
import { formatCompact } from "@/lib/utils";
import type { Story } from "@/types/content";

function priceLabel(cents?: number) {
  if (!cents || cents <= 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

function pageLabel(count: number) {
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

/** Premium story card with optional preview modal on the homepage. */
export function StoryCard({ story }: { story: Story }) {
  const interactive = useHomeInteractiveOptional();
  const [finePointer, setFinePointer] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18 });

  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 12);
  }

  function reset() {
    rx.set(0);
    ry.set(0);
  }

  const glow = useTransform(rotateY, [-12, 12], ["-20%", "120%"]);
  const isPaid = Boolean(story.priceCents && story.priceCents > 0);
  const href = story.slug ? `/story/${story.slug}` : "#";
  const pages = Math.max(story.pageCount ?? story.chapters ?? 1, 1);

  function onCardClick(e: React.MouseEvent) {
    if (e.shiftKey && story.slug) {
      window.location.assign(href);
      return;
    }

    if (interactive) {
      e.preventDefault();
      interactive.setPreviewStory(story);
      return;
    }

    if (story.slug) {
      window.location.assign(href);
    }
  }

  return (
    <motion.article
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={finePointer ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      whileHover={finePointer ? { y: -6 } : undefined}
      className="group glass relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-3"
    >
      <button
        type="button"
        onClick={onCardClick}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label={`Open ${story.title}`}
      />
      {story.slug && (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
          title="Open story directly"
          aria-label="Open story directly"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <Image
          src={story.cover}
          alt={story.title}
          fill
          sizes="(max-width: 768px) 80vw, 280px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {finePointer && (
          <motion.div
            aria-hidden
            style={{ left: glow }}
            className="pointer-events-none absolute top-0 h-full w-1/3 -skew-x-12 bg-white/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span className="glass-strong rounded-full px-2.5 py-1 text-xs font-medium">
            {story.genre}
          </span>
          {story.trending && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-xs font-medium text-white">
              <Flame className="h-3 w-3" /> Trending
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-tight text-white">
            {story.title}
          </h3>
          <span className="glass-strong flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white">
            <BookOpen className="h-3 w-3" />
            {pageLabel(pages)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{story.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" /> {story.rating.toFixed(1)}
          </span>
          <motion.span
            animate={isPaid ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={
              isPaid
                ? "flex items-center gap-1 font-medium text-[var(--color-accent)]"
                : "flex items-center gap-1 font-medium text-emerald-400"
            }
          >
            {isPaid && <Lock className="h-3 w-3" />}
            {priceLabel(story.priceCents)}
          </motion.span>
          <span>{formatCompact(story.reads)} reads</span>
        </div>
      </div>
    </motion.article>
  );
}

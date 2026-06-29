"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BookOpen, ExternalLink, Flame, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useHomeInteractiveOptional } from "@/components/landing/home-interactive-provider";
import { formatCompact } from "@/lib/utils";
import type { Story } from "@/types/content";

function pageLabel(count: number) {
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

function CardBody({ story, pages }: { story: Story; pages: number }) {
  return (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--color-surface)]">
        <Image
          src={story.cover}
          alt={story.title}
          fill
          sizes="(max-width: 768px) 80vw, 280px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {story.genre}
          </span>
          {story.trending && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-xs font-medium text-white">
              <Flame className="h-3 w-3" /> Trending
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-tight text-white drop-shadow-sm">
            {story.title}
          </h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <BookOpen className="h-3 w-3" />
            {pageLabel(pages)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-[var(--color-surface)] px-1 pt-3">
        <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{story.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" /> {story.rating.toFixed(1)}
          </span>
          <span className="font-medium text-emerald-400">Free to read</span>
          <span>{formatCompact(story.reads)} reads</span>
        </div>
      </div>
    </>
  );
}

/** Premium story card with optional preview modal on the homepage. */
export function StoryCard({ story }: { story: Story }) {
  const interactive = useHomeInteractiveOptional();
  const [finePointer, setFinePointer] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18 });

  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
    setCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
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
  const href = story.slug ? `/story/${story.slug}` : "#";
  const pages = Math.max(story.pageCount ?? story.chapters ?? 1, 1);
  const cardClass =
    "group story-card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-3";

  function onCardClick(e: React.MouseEvent) {
    if (e.shiftKey && story.slug) {
      window.location.assign(href);
      return;
    }

    if (coarsePointer && story.slug) {
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

  if (coarsePointer && story.slug) {
    return (
      <Link href={href} prefetch className={cardClass}>
        <CardBody story={story} pages={pages} />
      </Link>
    );
  }

  return (
    <motion.article
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={finePointer ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      whileHover={finePointer ? { y: -6 } : undefined}
      className={cardClass}
    >
      <button
        type="button"
        onClick={onCardClick}
        className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius-card)]"
        aria-label={`Open ${story.title}`}
      />
      {story.slug && (
        <Link
          href={href}
          prefetch
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
          title="Open story directly"
          aria-label="Open story directly"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
      {finePointer && (
        <motion.div
          aria-hidden
          style={{ left: glow }}
          className="pointer-events-none absolute top-0 z-[1] h-full w-1/3 -skew-x-12 bg-white/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <CardBody story={story} pages={pages} />
    </motion.article>
  );
}

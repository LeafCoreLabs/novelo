"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(() => go(1), 5500);
    return () => window.clearInterval(id);
  }, [count, paused, go]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section id="testimonials" className="container-page py-24">
      <SectionHeading
        eyebrow="Loved by the community"
        title="Readers and writers agree."
        description="Real reviews from signed-in readers and writers on Novelo."
      />

      {count === 0 ? (
        <Reveal>
          <p className="glass rounded-[var(--radius-card)] px-6 py-12 text-center text-sm text-[var(--color-muted)]">
            No reviews yet. Sign in, read a story, and share your thoughts — the best ones show up here.
          </p>
        </Reveal>
      ) : count === 1 ? (
        <Reveal>
          <TestimonialCard t={testimonials[0]!} active />
        </Reveal>
      ) : (
        <div
          className="relative mx-auto max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              className="glass hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="relative min-h-[280px] flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={testimonials[index]!.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  initial={{ opacity: 0, x: 40, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1.05 }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TestimonialCard t={testimonials[index]!} active />
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              className="glass hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
              aria-label="Next review"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Go to review ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-[var(--color-primary)]"
                    : "w-2 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TestimonialCard({ t, active }: { t: Testimonial; active?: boolean }) {
  return (
    <figure
      className={cn(
        "glass mx-auto flex max-w-xl flex-col rounded-[var(--radius-card)] p-7 transition-opacity",
        active ? "opacity-100" : "opacity-70",
      )}
    >
      <Quote className="h-8 w-8 text-[var(--color-primary)] opacity-60" />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--color-foreground)]/90">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image
            src={t.avatar}
            alt={t.name}
            fill
            sizes="40px"
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <div className="text-sm font-semibold">{t.name}</div>
          <div className="text-xs text-[var(--color-muted)]">{t.role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

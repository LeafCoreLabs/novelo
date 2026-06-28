"use client";

import gsap from "gsap";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { NavUser } from "@/components/landing/navbar";
import { useHomeInteractive } from "@/components/landing/home-interactive-provider";
import { useNavUser } from "@/hooks/use-nav-user";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import type { HeroSnippet, LandingContent, Story } from "@/types/content";

const GENRE_GRADIENT: Record<string, string> = {
  Fantasy: "from-rose-500 to-fuchsia-500",
  "Science Fiction": "from-orange-500 to-rose-500",
  Romance: "from-pink-500 to-rose-400",
  Mystery: "from-amber-500 to-orange-400",
  Thriller: "from-red-500 to-rose-500",
  Literary: "from-fuchsia-500 to-pink-400",
  Horror: "from-rose-600 to-red-500",
  Adventure: "from-orange-400 to-amber-400",
};

// Percentage-based so the same scattered cluster scales from phone → desktop.
const CARD_LAYOUT = [
  { top: "0%", left: "16%", rotate: -8, delay: 0 },
  { top: "18%", left: "52%", rotate: 6, delay: 0.4 },
  { top: "44%", left: "4%", rotate: 10, delay: 0.8 },
  { top: "60%", left: "46%", rotate: -5, delay: 1.2 },
];

type HeroCard =
  | { type: "story"; story: Story }
  | { type: "snippet"; snippet: HeroSnippet };

function buildHeroCards(
  stories: Story[],
  snippets: HeroSnippet[],
  limit = Number.POSITIVE_INFINITY,
): HeroCard[] {
  const cards: HeroCard[] = stories.slice(0, 4).map((story) => ({ type: "story", story }));
  for (const snippet of snippets) {
    if (cards.length >= limit) break;
    cards.push({ type: "snippet", snippet });
  }
  return cards;
}

export function Hero({ hero, user: initialUser = null }: { hero: LandingContent["hero"]; user?: NavUser }) {
  const user = useNavUser(initialUser);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { scrollY } = useScroll();
  const bookParallaxY = useTransform(scrollY, [0, 600], [0, 80]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !titleRef.current) return;

    const lines = titleRef.current.querySelectorAll("[data-hero-line]");
    gsap.fromTo(
      lines,
      { y: 48, opacity: 0, filter: "blur(8px)" },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.2,
      },
    );
  }, []);

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center justify-center pt-28 pb-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-[var(--color-muted)] lg:mx-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            {hero.eyebrow}
          </motion.div>

          <h1
            ref={titleRef}
            className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {hero.titleLines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <span
                  data-hero-line
                  className={
                    i === hero.titleLines.length - 1 ? "text-gradient inline-block" : "inline-block"
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          {hero.subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-auto mt-6 max-w-xl text-base text-[var(--color-muted)] sm:text-lg lg:mx-0"
            >
              {hero.subtitle}
            </motion.p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: hero.subtitle ? 0.65 : 0.5 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Magnetic>
              <Link href={hero.primaryCta.href}>
                <Button size="lg" className="group">
                  {hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Magnetic>
            {!user ? (
              <Link href={hero.secondaryCta.href}>
                <Button variant="glass" size="lg">
                  <UserPlus className="h-4 w-4" />
                  {hero.secondaryCta.label}
                </Button>
              </Link>
            ) : null}
          </motion.div>
        </div>

        <motion.div style={{ y: bookParallaxY }} className="mt-4 w-full min-w-0 lg:mt-0">
          <FloatingCards stories={hero.featuredStories} snippets={hero.snippets} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xs text-[var(--color-muted)] sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span>Scroll to explore</span>
          <span className="h-8 w-px bg-gradient-to-b from-[var(--color-foreground)] to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function cardGradient(card: HeroCard): string {
  return card.type === "story"
    ? GENRE_GRADIENT[card.story.genre] ?? "from-rose-500 to-fuchsia-500"
    : card.snippet.gradient;
}

function CardBody({ card, size }: { card: HeroCard; size: "sm" | "lg" }) {
  const labelCls = size === "lg" ? "text-xs" : "text-[10px]";

  if (card.type === "snippet") {
    const s = card.snippet;
    const bodyCls =
      size === "lg"
        ? s.kind === "shayari"
          ? "text-base font-medium"
          : "text-base font-semibold"
        : s.kind === "shayari"
          ? "text-[11px] font-medium"
          : "text-xs font-semibold";
    return (
      <>
        <span className={`relative font-medium uppercase tracking-wider text-white/70 ${labelCls}`}>
          {s.kind === "shayari" ? "Shayari" : "Quote"}
        </span>
        <p className={`relative leading-snug text-white/95 ${bodyCls}`}>{s.text}</p>
        {s.attribution ? (
          <span className={`relative text-white/60 ${size === "lg" ? "text-xs" : "text-[10px]"}`}>
            — {s.attribution}
          </span>
        ) : (
          <span className="relative mt-1 h-1 w-8 rounded-full bg-white/40" />
        )}
      </>
    );
  }

  return (
    <>
      {card.story.cover && (
        <>
          <Image
            src={card.story.cover}
            alt={card.story.title}
            fill
            sizes={size === "lg" ? "248px" : "128px"}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        </>
      )}
      <span className={`relative font-medium uppercase tracking-wider text-white/70 ${labelCls}`}>
        Story
      </span>
      <div>
        <span
          className={`relative line-clamp-3 font-semibold leading-tight text-white/95 ${size === "lg" ? "text-lg" : "text-sm"}`}
        >
          {card.story.title}
        </span>
        <span className="relative mt-1 block h-1 w-8 rounded-full bg-white/40" />
      </div>
    </>
  );
}

function MobileSwiper({
  cards,
  onSelect,
}: {
  cards: HeroCard[];
  onSelect: (story: Story) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="lg:hidden">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => {
          const key = card.type === "story" ? card.story.id : card.snippet.id;
          const isStory = card.type === "story";
          return (
            <div key={key} className="flex w-full shrink-0 snap-center justify-center px-2">
              <motion.button
                type="button"
                disabled={!isStory}
                onClick={isStory ? () => onSelect(card.story) : undefined}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className={`relative flex h-72 w-full max-w-[17rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${cardGradient(card)} p-6 text-left shadow-[var(--shadow-glow)] ${isStory ? "cursor-pointer" : "cursor-default"}`}
              >
                <CardBody card={card} size="lg" />
              </motion.button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {cards.map((card, i) => {
          const key = card.type === "story" ? card.story.id : card.snippet.id;
          return (
            <button
              key={key}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              aria-current={active === i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? "w-6 bg-[var(--color-primary)]" : "w-2 bg-white/30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function FloatingCards({ stories, snippets }: { stories: Story[]; snippets: HeroSnippet[] }) {
  const { setPreviewStory } = useHomeInteractive();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 80, damping: 20 });
  const py = useSpring(my, { stiffness: 80, damping: 20 });
  const offsetX = useTransform(px, [-0.5, 0.5], [-18, 18]);
  const offsetY = useTransform(py, [-0.5, 0.5], [-12, 12]);

  // Mobile shows every card (all shayari); desktop cluster is capped at 4 slots.
  const mobileCards = buildHeroCards(stories, snippets);
  const desktopCards = buildHeroCards(stories, snippets, 4);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <>
      {/* Mobile / tablet: one-card-at-a-time swiper */}
      <MobileSwiper cards={mobileCards} onSelect={setPreviewStory} />

      {/* Desktop: floating animated cluster */}
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ x: offsetX, y: offsetY }}
        className="relative mx-auto hidden h-[28rem] lg:block"
      >
        {desktopCards.map((card, i) => {
          const layout = CARD_LAYOUT[i];
          if (!layout) return null;

          const key = card.type === "story" ? card.story.id : card.snippet.id;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 + i * 0.15 }}
              style={{ top: layout.top, left: layout.left }}
              className="absolute"
            >
              <motion.div
                role={card.type === "story" ? "button" : undefined}
                tabIndex={card.type === "story" ? 0 : undefined}
                onClick={card.type === "story" ? () => setPreviewStory(card.story) : undefined}
                onKeyDown={
                  card.type === "story"
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setPreviewStory(card.story);
                        }
                      }
                    : undefined
                }
                whileHover={card.type === "story" ? { scale: 1.04 } : undefined}
                animate={{ y: [0, -16, 0], rotate: [layout.rotate, layout.rotate + 2, layout.rotate] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: layout.delay }}
                className={`relative flex h-44 w-32 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${cardGradient(card)} p-3.5 text-left shadow-[var(--shadow-glow)] ${card.type === "story" ? "cursor-pointer transition-shadow hover:shadow-[0_0_40px_rgba(255,95,143,0.35)]" : ""}`}
              >
                <CardBody card={card} size="sm" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

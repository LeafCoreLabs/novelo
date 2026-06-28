"use client";

import {
  BookOpen,
  Compass,
  Ghost,
  Heart,
  type LucideIcon,
  Rocket,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

import { useHomeInteractive } from "@/components/landing/home-interactive-provider";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn, formatCompact } from "@/lib/utils";
import type { Category } from "@/types/content";

const icons: Record<string, LucideIcon> = {
  Sparkles,
  Rocket,
  Heart,
  Search,
  Zap,
  BookOpen,
  Ghost,
  Compass,
};

export function Categories({ categories }: { categories: Category[] }) {
  const { selectedGenre, toggleGenre, setSelectedGenre } = useHomeInteractive();

  return (
    <section id="categories" className="container-page py-24">
      <SectionHeading
        eyebrow="Genres & Categories"
        title="Find your next obsession."
        description="Tap a genre to filter the library — tap again to show all stories."
      />

      <Reveal className="mb-6">
        <button
          type="button"
          onClick={() => setSelectedGenre(null)}
          className={cn(
            "glass rounded-full px-4 py-2 text-sm transition-all",
            selectedGenre === null
              ? "bg-[var(--color-primary)]/20 text-[var(--color-foreground)] ring-2 ring-[var(--color-primary)]/40"
              : "text-[var(--color-muted)] hover:bg-white/5",
          )}
        >
          All stories
        </button>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat, i) => {
          const Icon = icons[cat.icon] ?? Sparkles;
          const active = selectedGenre === cat.name;
          return (
            <Reveal key={cat.id} delay={i * 0.05} as="div">
              <button
                type="button"
                onClick={() => toggleGenre(cat.name)}
                className={cn(
                  "group glass relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] p-5 text-left transition-transform hover:-translate-y-1",
                  active && "ring-2 ring-[var(--color-primary)]/50",
                )}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.accent} text-white shadow-lg`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {formatCompact(cat.count)} {cat.count === 1 ? "story" : "stories"}
                  </p>
                </div>
                <div
                  className={cn(
                    `absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${cat.accent} blur-2xl transition-opacity duration-500`,
                    active ? "opacity-50" : "opacity-0 group-hover:opacity-40",
                  )}
                />
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useHomeInteractive } from "@/components/landing/home-interactive-provider";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { StoryCard } from "@/components/landing/story-card";
import type { Story } from "@/types/content";

export function StorySection({
  id,
  eyebrow,
  title,
  description,
  stories,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  stories: Story[];
}) {
  const { filterStories, selectedGenre } = useHomeInteractive();
  const filtered = filterStories(stories);

  return (
    <section id={id} className="container-page py-24">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <AnimatePresence mode="popLayout">
        <motion.div
          key={selectedGenre ?? "all"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {filtered.length === 0 ? (
            <Reveal className="col-span-full">
              <p className="glass rounded-[var(--radius-card)] px-6 py-12 text-center text-sm text-[var(--color-muted)]">
                {selectedGenre
                  ? `No stories in ${selectedGenre} yet. Try another genre or check back soon.`
                  : "No stories published yet. Check back soon — new work is on the way."}
              </p>
            </Reveal>
          ) : (
            filtered.map((story, i) => (
              <Reveal key={story.id} delay={i * 0.08} as="div">
                <StoryCard story={story} />
              </Reveal>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

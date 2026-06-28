"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";

import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { AboutAuthor } from "@/types/content";

export function About({ about }: { about: AboutAuthor }) {
  return (
    <section id="about" className="container-page py-24">
      <Reveal>
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          About the author
        </span>
      </Reveal>

      <div className="mt-8 max-w-3xl">
        <Reveal delay={0.06}>
          <div className="flex items-center gap-1.5 font-display text-2xl font-semibold tracking-tight">
            {about.name}
            <BadgeCheck className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{about.role}</p>
          <p className="text-xs text-[var(--color-muted)]">{about.penName}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-foreground)]/85">
            {about.bioLong}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {about.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.3}>
              <a href="#latest">
                <Button size="lg" className="group">
                  Read my stories
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </Magnetic>
            {about.socials.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                whileHover={{ y: -2 }}
                className="glass rounded-full px-4 py-2.5 text-sm text-[var(--color-foreground)] transition-colors hover:bg-white/10"
              >
                {s.label}
              </motion.a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { Stat } from "@/types/content";

const DETAILS: Record<string, string> = {
  "Stories published": "Publish new work from Admin → Write when you're signed in as the author.",
  "Chapters written": "Each published story adds to your serialized library on Novelo.",
  "Total reads": "Every signed-in reading session counts toward this total.",
  Subscribers: "Newsletter subscribers get notified when new chapters go live.",
};

export function Stats({ stats }: { stats: Stat[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="container-page py-16">
      <div className="glass-strong relative overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-10">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {stats.map((stat, i) => {
            const open = expanded === stat.id;
            return (
              <Reveal key={stat.id} delay={i * 0.1} as="div">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : stat.id)}
                  className={cn(
                    "group w-full rounded-2xl p-2 text-center transition-transform hover:-translate-y-1",
                    open && "bg-white/5",
                  )}
                >
                  <div className="font-display text-4xl font-semibold text-gradient sm:text-5xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{stat.label}</p>
                  <motion.p
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    className="overflow-hidden text-xs leading-relaxed text-[var(--color-accent)]"
                  >
                    <span className="block pt-2">{DETAILS[stat.label] ?? "Live from your Novelo library."}</span>
                  </motion.p>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

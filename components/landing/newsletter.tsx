"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useActionState, useMemo } from "react";

import { subscribeAction, type NewsletterState } from "@/actions/newsletter";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import type { LandingContent } from "@/types/content";

const initial: NewsletterState = {};

function SuccessBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 220,
        y: (Math.random() - 0.5) * 120,
        delay: Math.random() * 0.2,
        hue: i % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)",
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.4], x: p.x, y: p.y }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          style={{ background: p.hue }}
        />
      ))}
    </div>
  );
}

export function Newsletter({ newsletter }: { newsletter: LandingContent["newsletter"] }) {
  const [state, formAction, pending] = useActionState(subscribeAction, initial);

  return (
    <section id="newsletter" className="container-page py-24">
      <div className="glass-strong relative overflow-hidden rounded-[var(--radius-xl)] px-6 py-16 text-center sm:px-12">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div
            className="aurora-blob h-72 w-72"
            style={{
              top: "-4rem",
              left: "10%",
              background: "radial-gradient(circle, var(--color-aurora-1), transparent 60%)",
              animation: "var(--animate-aurora)",
            }}
          />
          <div
            className="aurora-blob h-72 w-72"
            style={{
              bottom: "-6rem",
              right: "8%",
              background: "radial-gradient(circle, var(--color-aurora-2), transparent 60%)",
              animation: "var(--animate-aurora)",
              animationDelay: "-9s",
            }}
          />
        </div>

        <AnimatePresence>{state.ok && <SuccessBurst />}</AnimatePresence>

        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {newsletter.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">{newsletter.subtitle}</p>

        {state.ok ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-full bg-emerald-500/15 px-5 py-3 text-sm text-emerald-300"
          >
            <Check className="h-4 w-4" /> You&apos;re subscribed — watch your inbox for new chapters.
          </motion.div>
        ) : (
          <form action={formAction} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="glass h-12 flex-1 rounded-full px-5 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <Magnetic strength={0.25}>
              <Button type="submit" size="lg" disabled={pending} className="group w-full sm:w-auto">
                {pending ? "Subscribing…" : "Subscribe"}
                {!pending && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </Magnetic>
          </form>
        )}

        {state.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}
      </div>
    </section>
  );
}

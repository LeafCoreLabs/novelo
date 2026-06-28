"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Fixed top bar showing page scroll progress (GPU scaleX). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
      }}
    />
  );
}

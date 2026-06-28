"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

function HomepageScrollProgress() {
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

/** Fixed top bar showing page scroll progress. Homepage only — avoids Lenis conflicts. */
export function ScrollProgress() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <HomepageScrollProgress />;
}

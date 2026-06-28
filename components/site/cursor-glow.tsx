"use client";

import { useEffect, useRef } from "react";

/**
 * Soft glow that follows the cursor.
 *
 * Performance: we move a single pre-painted radial-gradient element via
 * `transform: translate3d(...)` inside a rAF loop, instead of re-writing the
 * `background` string on every mousemove (which forces a full repaint). The
 * transform is GPU-composited, so it stays smooth even while scrolling.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine || !ref.current) return;

    const el = ref.current;
    el.style.opacity = "1";

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const render = () => {
      el.style.transform = `translate3d(${targetX - 280}px, ${targetY - 280}px, 0)`;
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 h-[560px] w-[560px] opacity-0"
      style={{
        background:
          "radial-gradient(circle, rgba(255, 87, 115, 0.12), transparent 65%)",
        willChange: "transform",
      }}
    />
  );
}

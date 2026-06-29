"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { clearScrollLocks } from "@/components/site/route-scroll-reset";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

/** Smooth-scroll to a hash target (e.g. #latest). Falls back to native scroll. */
export function scrollToHash(hash: string, lenis: Lenis | null) {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, { offset: -96, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function isHomepage(pathname: string) {
  return pathname === "/";
}

function canUseLenis() {
  if (typeof window === "undefined") return false;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  // Touch/mobile uses native scroll only — Lenis breaks scroll after client navigation.
  return !prefersReduced && finePointer;
}

/** Lenis smooth-scrolling on the marketing homepage (desktop only); native scroll elsewhere. */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef(0);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const teardown = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setLenis(null);
      clearScrollLocks();
    };

    const enableLenis = isHomepage(pathname) && canUseLenis();

    if (!enableLenis) {
      teardown();
      return;
    }

    const active = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: false,
    });
    lenisRef.current = active;
    setLenis(active);

    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !lenisRef.current || !isHomepage(pathname)) return;
      clearScrollLocks();
      lenisRef.current.start();
      lenisRef.current.resize();
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      teardown();
    };
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

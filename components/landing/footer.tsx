"use client";

import { ArrowUp, BookMarked, Github, Twitter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { publicEnv } from "@/lib/env";
import { scrollToHash, useLenis } from "@/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

const columns = [
  {
    title: "Read",
    links: [
      { label: "Latest", href: "/#latest" },
      { label: "All stories", href: "/stories" },
      { label: "Library", href: "/#popular" },
      { label: "Genres", href: "/#categories" },
      { label: "About", href: "/#about" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Author",
    links: [
      { label: "About", href: "/#about" },
      { label: "Newsletter", href: "/#newsletter" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
      { label: "Subscribe", href: "/#newsletter" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/privacy" },
    ],
  },
];

export function Footer({ brand, tagline }: { brand: string; tagline: string }) {
  const lenis = useLenis();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="relative mt-12 border-t border-[var(--color-border)]">
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => scrollToHash("#top", lenis)}
        className={cn(
          "glass fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-[var(--shadow-soft)] transition-all",
          showTop ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                <BookMarked className="h-4 w-4" />
              </span>
              <span className="text-lg">{brand}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-[var(--color-muted)]">{tagline}</p>
            <div className="mt-5 flex gap-3">
              <a
                href="#top"
                aria-label="Twitter"
                className="glass flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={publicEnv.NEXT_PUBLIC_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="glass flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {brand}.{" "}
              <a
                href={publicEnv.NEXT_PUBLIC_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Open source on GitHub
              </a>
            </p>
            <p className="text-center sm:text-right">Next.js · Prisma · Supabase</p>
          </div>
          <p className="text-center text-xs leading-relaxed text-[var(--color-muted)]/90 sm:text-left">
            This website is made and maintained by{" "}
            <span className="font-medium text-[var(--color-foreground)]/80">LeafCore Labs</span>
            , Bangalore, IN · Copyright 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

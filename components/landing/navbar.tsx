"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { BookMarked, LogOut, Menu, PenLine, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { logoutAction } from "@/actions/auth";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scrollToHash, useLenis } from "@/providers/smooth-scroll-provider";
import type { NavItem } from "@/types/content";

export type NavUser = { name: string; role: string } | null;

function UserBadge({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/5 px-3 py-1.5",
        className,
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-xs font-semibold text-[var(--color-primary)]">
        {initial}
      </span>
      <span className="truncate text-sm text-[var(--color-foreground)]">{name}</span>
    </span>
  );
}

function NavAnchor({
  item,
  active,
  onNavigate,
  className,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (href: string) => void;
  className?: string;
}) {
  const hash = item.href.startsWith("#") ? item.href : `#${item.href}`;

  return (
    <button
      type="button"
      onClick={() => onNavigate(hash)}
      className={cn(
        "rounded-full px-4 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--color-primary)]/15 text-[var(--color-foreground)]"
          : "text-[var(--color-muted)] hover:bg-white/5 hover:text-[var(--color-foreground)]",
        className,
      )}
    >
      {item.label}
    </button>
  );
}

export function Navbar({ brand, nav, user }: { brand: string; nav: NavItem[]; user: NavUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const activeSection = useScrollSpy();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open]);

  const isAdmin = user?.role === "ADMIN" || user?.role === "EDITOR";

  function navigate(hash: string) {
    scrollToHash(hash, lenis);
    setOpen(false);
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "relative z-50 flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500",
          open || scrolled
            ? "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] md:glass-strong md:glass-blur"
            : "max-md:border max-md:border-[var(--color-border)] max-md:bg-[var(--color-surface)] md:bg-transparent",
        )}
      >
        <Link href="/#top" className="flex items-center gap-2 pl-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <BookMarked className="h-4 w-4" />
          </span>
          <span className="text-lg">{brand}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const id = item.href.replace(/^#/, "");
            return (
              <li key={item.href}>
                <NavAnchor
                  item={item}
                  active={activeSection === id}
                  onNavigate={navigate}
                />
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="glass" size="sm">
                  <PenLine className="h-4 w-4" /> Write
                </Button>
              </Link>
            )}
            {user ? (
              <>
                <UserBadge name={user.name} className="max-w-[11rem]" />
                <form action={logoutAction}>
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Magnetic strength={0.3}>
                  <Link href="/signup">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </Magnetic>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/75 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed left-4 right-4 top-[4.75rem] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)] md:hidden"
            >
              <ul className="flex flex-col gap-1">
              {nav.map((item) => {
                const id = item.href.replace(/^#/, "");
                return (
                  <li key={item.href}>
                    <NavAnchor
                      item={item}
                      active={activeSection === id}
                      onNavigate={navigate}
                      className="block w-full rounded-2xl px-4 py-3 text-left text-[var(--color-foreground)] hover:bg-white/10"
                    />
                  </li>
                );
              })}
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-[var(--color-foreground)] hover:bg-white/10"
                  >
                    Write a story
                  </Link>
                </li>
              )}
              {!user && (
                <li className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </li>
              )}
              {user && (
                <li className="space-y-3 pt-2">
                  <UserBadge name={user.name} className="w-full" />
                  <form action={logoutAction}>
                    <Button variant="outline" size="sm" type="submit" className="w-full">
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </form>
                </li>
              )}
            </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

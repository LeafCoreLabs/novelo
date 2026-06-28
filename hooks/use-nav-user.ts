"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { NavUser } from "@/components/landing/navbar";

/** Keeps nav auth UI in sync after login/logout and client navigations. */
export function useNavUser(initial: NavUser = null) {
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser>(initial);

  useEffect(() => {
    setUser(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/session", { credentials: "same-origin", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data: { user: NavUser }) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(initial);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, initial]);

  return user;
}

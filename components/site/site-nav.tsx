import { cookies } from "next/headers";

import { Navbar, type NavUser } from "@/components/landing/navbar";
import { getSession } from "@/lib/auth";
import { STATIC_BRAND, STATIC_NAV } from "@/services/landing.service";

/** Server wrapper — session only; nav/brand are static (no extra DB fetch). */
export async function SiteNav({ user: userProp }: { user?: NavUser } = {}) {
  cookies();

  const user =
    userProp !== undefined
      ? userProp
      : await getSession().then((session) =>
          session ? { name: session.name, role: session.role } : null,
        );

  return (
    <Navbar
      brand={STATIC_BRAND.name}
      nav={STATIC_NAV}
      user={user}
    />
  );
}

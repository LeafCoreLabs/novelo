import { cookies } from "next/headers";

import { Navbar } from "@/components/landing/navbar";
import { getSession } from "@/lib/auth";
import { STATIC_BRAND, STATIC_NAV } from "@/services/landing.service";

/** Server wrapper — always reads the live session cookie for auth UI. */
export async function SiteNav() {
  cookies();

  const session = await getSession();
  const user = session ? { name: session.name, role: session.role } : null;

  return <Navbar brand={STATIC_BRAND.name} nav={STATIC_NAV} user={user} />;
}

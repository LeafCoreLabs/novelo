import { Navbar } from "@/components/landing/navbar";
import { getSession } from "@/lib/auth";
import { STATIC_BRAND, STATIC_NAV } from "@/services/landing.service";

/** Server wrapper — session only; nav/brand are static (no extra DB fetch). */
export async function SiteNav() {
  const user = await getSession();
  return (
    <Navbar
      brand={STATIC_BRAND.name}
      nav={STATIC_NAV}
      user={user ? { name: user.name, role: user.role } : null}
    />
  );
}

import { Navbar } from "@/components/landing/navbar";
import { getSession } from "@/lib/auth";
import { getLandingContent } from "@/services/landing.service";

/** Server wrapper that supplies the current session + nav config to the Navbar. */
export async function SiteNav() {
  const [user, content] = await Promise.all([getSession(), getLandingContent()]);
  return (
    <Navbar
      brand={content.brand.name}
      nav={content.nav}
      user={user ? { name: user.name, role: user.role } : null}
    />
  );
}

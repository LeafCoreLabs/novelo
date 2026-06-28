import { redirect } from "next/navigation";

import { SiteNav } from "@/components/site/site-nav";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/login?next=/admin");

  return (
    <>
      <SiteNav />
      <main className="container-page pt-28 pb-24">{children}</main>
    </>
  );
}

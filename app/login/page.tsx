import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await getSession();
  const destination = next ?? "/";

  if (session) {
    if (destination.startsWith("/admin") && !isAdmin(session)) {
      return <AuthCard mode="login" next={destination} />;
    }
    redirect(destination);
  }

  return <AuthCard mode="login" next={destination} />;
}

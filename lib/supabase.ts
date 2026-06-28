import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env";

/** Server-side Supabase project metadata (Postgres is accessed via Prisma). */
export function supabaseConfig() {
  const env = serverEnv();
  return {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/** Admin Supabase client (bypasses RLS). Server-only. */
export function createSupabaseAdmin() {
  const { url, serviceRoleKey } = supabaseConfig();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Build Prisma Postgres URLs for a Supabase project (ap-south-1 pooler). */
export function buildSupabaseDatabaseUrls(projectRef: string, password: string) {
  const encoded = encodeURIComponent(password);
  const host = `aws-0-ap-south-1.pooler.supabase.com`;
  const user = `postgres.${projectRef}`;
  return {
    databaseUrl: `postgresql://${user}:${encoded}@${host}:6543/postgres?pgbouncer=true&connection_limit=1`,
    directUrl: `postgresql://${user}:${encoded}@${host}:5432/postgres`,
  };
}

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createClient> | null = null;

/** Browser Supabase client (anon key). Returns null when not configured. */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}

export const appPublicEnv = publicEnv;

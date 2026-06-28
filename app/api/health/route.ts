import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe — includes database connectivity when configured. */
export async function GET() {
  const env = serverEnv();
  let database: "ok" | "skipped" | "error" = "skipped";

  if (env.DATABASE_URL && !env.DATABASE_URL.includes("YOUR_DB_PASSWORD")) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "ok";
    } catch {
      database = "error";
    }
  }

  const healthy = database !== "error";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "Novelo-web",
      database,
      storage: env.STORAGE_PROVIDER,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}

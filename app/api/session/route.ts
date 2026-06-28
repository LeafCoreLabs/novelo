import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Returns the current signed-in user for client nav sync (httpOnly cookie). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: { name: session.name, role: session.role },
  });
}

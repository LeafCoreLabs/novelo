import { NextResponse, type NextRequest } from "next/server";

const TUNNEL_ORIGIN_RE =
  /^https?:\/\/([a-z0-9-]+\.(loca\.lt|trycloudflare\.com|ngrok-free\.app|ngrok\.io|ngrok\.app))$/i;

function isTunnelOrigin(origin: string | null) {
  return Boolean(origin && TUNNEL_ORIGIN_RE.test(origin));
}

/**
 * Edge middleware: applies baseline security headers to every response.
 * Auth/route-protection logic (role-based) is layered in here in a later phase.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development" && request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    if (isTunnelOrigin(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin!,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
  }

  const response = NextResponse.next();

  if (process.env.NODE_ENV === "development") {
    const origin = request.headers.get("origin");
    if (isTunnelOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

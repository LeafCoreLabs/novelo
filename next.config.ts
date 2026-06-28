import path from "node:path";

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Tunnel / LAN hosts allowed to load the Next.js dev server cross-origin. */
const allowedDevOrigins = [
  "*.loca.lt",
  "loca.lt",
  "*.trycloudflare.com",
  "*.ngrok-free.app",
  "*.ngrok.io",
  "*.ngrok.app",
  "172.31.95.77",
  "127.0.0.1",
];

if (process.env.TUNNEL_HOST) {
  allowedDevOrigins.push(process.env.TUNNEL_HOST);
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for localtunnel / ngrok / Cloudflare tunnels in dev — without this,
  // Next.js blocks /_next/* asset requests from non-localhost origins (CORS).
  allowedDevOrigins,
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd()),
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "minio" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

// Extra CORS headers in dev so tunnel clients can fetch pages + assets reliably.
if (isDev) {
  nextConfig.headers = async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch",
        },
      ],
    },
  ];
}

export default nextConfig;

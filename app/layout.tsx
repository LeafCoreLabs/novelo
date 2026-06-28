import type { Metadata, Viewport } from "next";

import { CursorGlow } from "@/components/site/cursor-glow";
import { IconPatternBackground } from "@/components/site/icon-pattern-background";
import { LoadingScreen } from "@/components/site/loading-screen";
import { RouteScrollReset } from "@/components/site/route-scroll-reset";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { publicEnv } from "@/lib/env";
import { QueryProvider } from "@/providers/query-provider";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${publicEnv.NEXT_PUBLIC_APP_NAME} — Read between the worlds`,
    template: `%s · ${publicEnv.NEXT_PUBLIC_APP_NAME}`,
  },
  description:
    "Novelo — read between the worlds. Serialized fiction across fantasy, sci-fi, and everything in between, with new chapters every week.",
  keywords: ["stories", "fiction", "reading", "serialized", "fantasy", "sci-fi", "Novelo"],
  openGraph: {
    type: "website",
    title: `${publicEnv.NEXT_PUBLIC_APP_NAME} — Read between the worlds`,
    description: "Serialized fiction for nights that refuse to end. New chapters every week.",
    siteName: publicEnv.NEXT_PUBLIC_APP_NAME,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b12" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <RouteScrollReset />
            <LoadingScreen />
            <IconPatternBackground />
            <CursorGlow />
            <ScrollProgress />
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

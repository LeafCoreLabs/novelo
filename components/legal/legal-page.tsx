import Link from "next/link";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="container-page max-w-3xl py-28">
      <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        ← Back to Novelo
      </Link>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="prose-reader mt-8 space-y-5 text-[var(--color-foreground)]/85">{children}</div>
    </main>
  );
}

"use client";

import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function PublishSuccessBanner({ slug, updated }: { slug: string; updated?: boolean }) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!updated) {
      sessionStorage.setItem("novelo_published_slug", slug);
      sessionStorage.setItem("novelo_published_at", String(Date.now()));
      sessionStorage.removeItem("novelo_cover_url");
    }
  }, [slug, updated]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    router.replace("/admin");
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-emerald-100">
          {updated ? "Story updated successfully." : "Story published successfully."}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <Link href={`/story/${slug}`} className="text-[var(--color-accent)] hover:underline">
            View story →
          </Link>
          <Link href={`/admin/stories/${slug}/edit`} className="text-[var(--color-accent)] hover:underline">
            Edit story →
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="rounded-full p-1 text-emerald-200/80 hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

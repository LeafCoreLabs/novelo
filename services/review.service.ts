import "server-only";

import { prisma } from "@/lib/prisma";
import type { Testimonial } from "@/types/content";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80";

function roleLabel(role: string) {
  if (role === "ADMIN" || role === "EDITOR" || role === "WRITER") return "Writer";
  return "Reader";
}

export async function getLiveTestimonials(take = 3): Promise<Testimonial[]> {
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { role: true, profile: { select: { displayName: true, avatarUrl: true } } } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    quote: r.body,
    name: r.user.profile?.displayName ?? "Novelo member",
    role: roleLabel(r.user.role),
    avatar: r.user.profile?.avatarUrl || FALLBACK_AVATAR,
  }));
}

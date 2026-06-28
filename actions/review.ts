"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ReviewState {
  error?: string;
  ok?: boolean;
}

const reviewSchema = z.object({
  storyId: z.string().min(1),
  slug: z.string().min(1),
  body: z.string().min(10, "Write at least 10 characters.").max(500, "Keep it under 500 characters."),
  rating: z.coerce.number().min(1).max(5).default(5),
});

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to leave a review." };

  const parsed = reviewSchema.safeParse({
    storyId: formData.get("storyId"),
    slug: formData.get("slug"),
    body: formData.get("body"),
    rating: formData.get("rating") ?? 5,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const { storyId, slug, body, rating } = parsed.data;

  try {
    await prisma.review.upsert({
      where: { storyId_userId: { storyId, userId: session.id } },
      update: { body, rating },
      create: { storyId, userId: session.id, body, rating },
    });

    const agg = await prisma.review.aggregate({
      where: { storyId },
      _avg: { rating: true },
    });
    await prisma.story.update({
      where: { id: storyId },
      data: { ratingAvg: agg._avg.rating ?? rating },
    });
  } catch {
    return { error: "Could not save your review." };
  }

  revalidatePath(`/story/${slug}`);
  revalidatePath("/");
  return { ok: true };
}

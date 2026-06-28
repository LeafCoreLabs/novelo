"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export interface StoryFormState {
  error?: string;
}

const storySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  excerpt: z.string().min(10, "Add a short preview/teaser (at least 10 characters)."),
  content: z.string().min(20, "Story content is too short."),
  coverUrl: z.string().min(1, "Add a thumbnail image."),
  genreId: z.string().optional(),
  price: z.coerce.number().min(0).max(999).default(0),
  publish: z.string().optional(),
  agreeWriterTerms: z.literal("on", {
    message: "You must agree to the writer terms before publishing.",
  }),
});

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "story";
  let slug = root;
  let n = 1;
  while (await prisma.story.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export async function createStoryAction(
  _prev: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const session = await getSession();
  if (!isAdmin(session) || !session) return { error: "Not authorized." };

  const parsed = storySchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverUrl: formData.get("coverUrl"),
    genreId: formData.get("genreId") || undefined,
    price: formData.get("price") ?? 0,
    publish: formData.get("publish") ?? undefined,
    agreeWriterTerms: formData.get("agreeWriterTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid story details." };
  }

  const data = parsed.data;
  const published = data.publish === "on" || data.publish === "true";
  let slug: string;

  try {
    slug = await uniqueSlug(data.title);
    await prisma.story.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverUrl: data.coverUrl,
        priceCents: Math.round(data.price * 100),
        genreId: data.genreId || null,
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
        authorId: session.id,
      },
    });

    await prisma.user.update({
      where: { id: session.id },
      data: { writerTermsAcceptedAt: new Date() },
    });
  } catch {
    return { error: "Could not save the story. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/stories");
  revalidateTag("landing");
  redirect(`/story/${slug}`);
}

export async function unlockStoryAction(formData: FormData): Promise<void> {
  const session = await getSession();
  const storyId = String(formData.get("storyId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!session) {
    redirect(`/login?next=/story/${slug}`);
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) redirect(`/story/${slug}`);

  // Mock payment in development. In production this is where Stripe checkout
  // would complete and a webhook would create the Purchase entitlement.
  await prisma.purchase.upsert({
    where: { userId_storyId: { userId: session.id, storyId } },
    update: {},
    create: { userId: session.id, storyId, amountCents: story.priceCents, provider: "mock" },
  });

  revalidatePath(`/story/${slug}`);
  redirect(`/story/${slug}`);
}

export async function deleteStoryAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/login?next=/admin");

  const storyId = String(formData.get("storyId") ?? "");
  if (!storyId) redirect("/admin");

  await prisma.story.update({
    where: { id: storyId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/stories");
  revalidateTag("landing");
  redirect("/admin");
}

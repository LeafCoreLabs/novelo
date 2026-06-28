"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

export interface NewsletterState {
  ok?: boolean;
  error?: string;
}

export async function subscribeAction(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { error: "Please enter a valid email." };

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  } catch {
    return { error: "Could not subscribe right now. Try again." };
  }

  return { ok: true };
}

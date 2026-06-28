"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession, hashPassword, verifyPassword, type Role } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export interface AuthState {
  error?: string;
}

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  agreeTerms: z.literal("on", { message: "You must agree to the Terms and Privacy Policy." }),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

function isStaffRole(role: string) {
  return role === "ADMIN" || role === "EDITOR";
}

async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }
  return user;
}

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Only allow internal paths.
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    agreeTerms: formData.get("agreeTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { name, email, password } = parsed.data;
  const next = safeNext(formData.get("next"));

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with that email already exists." };

    const baseHandle = slugify(name) || "reader";
    const handle = `${baseHandle}-${Math.random().toString(36).slice(2, 6)}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        role: "READER",
        readerTermsAcceptedAt: new Date(),
        profile: { create: { displayName: name, handle } },
      },
    });

    await createSession({ id: user.id, email: user.email, role: user.role as Role, name });
  } catch {
    return { error: "Something went wrong creating your account." };
  }

  redirect(next);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { email, password } = parsed.data;
  const next = safeNext(formData.get("next"));

  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return { error: "Incorrect email or password." };
    }

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.profile?.displayName ?? email,
    });
  } catch {
    return { error: "Something went wrong signing in." };
  }

  redirect(next);
}

/** Admin/editor sign-in — rejects accounts without staff access. */
export async function adminLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { email, password } = parsed.data;
  const next = safeNext(formData.get("next"));
  const adminNext = next.startsWith("/admin") ? next : "/admin";

  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return { error: "Incorrect email or password." };
    }
    if (!isStaffRole(user.role)) {
      return { error: "This account does not have admin access." };
    }

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.profile?.displayName ?? email,
    });
  } catch {
    return { error: "Something went wrong signing in." };
  }

  redirect(adminNext);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

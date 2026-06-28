import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env";

export const SESSION_COOKIE = "novelo_session";

export type Role = "GUEST" | "READER" | "WRITER" | "EDITOR" | "MODERATOR" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

function secretKey() {
  return new TextEncoder().encode(serverEnv().JWT_SECRET);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Sign a session JWT and store it in an httpOnly cookie. */
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Read + verify the current session. Returns null if unauthenticated. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      id: String(payload.sub),
      email: String(payload.email ?? ""),
      role: (payload.role as Role) ?? "READER",
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN" || user?.role === "EDITOR";
}

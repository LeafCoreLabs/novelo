"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookMarked, Shield } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { adminLoginAction, loginAction, signupAction, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: AuthState = {};

export function AuthCard({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const isLogin = mode === "login";
  const adminDefault = isLogin && (next === "/admin" || next.startsWith("/admin/"));
  const [loginTab, setLoginTab] = useState<"reader" | "admin">(adminDefault ? "admin" : "reader");

  const [readerState, readerAction, readerPending] = useActionState(loginAction, initial);
  const [adminState, adminAction, adminPending] = useActionState(adminLoginAction, initial);
  const [signupState, signupActionBound, signupPending] = useActionState(signupAction, initial);

  const state = isLogin ? (loginTab === "admin" ? adminState : readerState) : signupState;
  const formAction = isLogin
    ? loginTab === "admin"
      ? adminAction
      : readerAction
    : signupActionBound;
  const pending = isLogin
    ? loginTab === "admin"
      ? adminPending
      : readerPending
    : signupPending;

  return (
    <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative w-full max-w-md rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-soft)]"
      >
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <BookMarked className="h-4 w-4" />
          </span>
          <span className="text-lg">Novelo</span>
        </Link>

        {isLogin ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setLoginTab("reader")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  loginTab === "reader"
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                Reader sign in
              </button>
              <button
                type="button"
                onClick={() => setLoginTab("admin")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  loginTab === "admin"
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </button>
            </div>

            {loginTab === "reader" ? (
              <>
                <h1 className="text-center font-display text-2xl font-semibold tracking-tight">
                  Welcome back
                </h1>
                <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
                  Sign in to keep reading after the free preview. Paid titles unlock after a
                  one-time payment.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-center font-display text-2xl font-semibold tracking-tight">
                  Admin sign in
                </h1>
                <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
                  For site owners and editors only. Reader accounts cannot access the admin panel.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <h1 className="text-center font-display text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
              Create a free account to continue reading after the first 2 sections.
            </p>
          </>
        )}

        <form action={formAction} className="mt-7 space-y-3">
          <input type="hidden" name="next" value={isLogin && loginTab === "admin" ? "/admin" : next} />

          {!isLogin && (
            <Field label="Name" name="name" type="text" placeholder="Your name" autoComplete="name" />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder={loginTab === "admin" ? "admin@novelo.local" : "you@example.com"}
            autoComplete="email"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {state?.error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
          )}

          {!isLogin && (
            <label className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
              <input
                type="checkbox"
                name="agreeTerms"
                required
                className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[var(--color-accent)] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[var(--color-accent)] hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}

          <Button type="submit" size="lg" disabled={pending} className="group mt-2 w-full">
            {pending
              ? "Please wait…"
              : isLogin
                ? loginTab === "admin"
                  ? "Sign in to admin"
                  : "Sign in"
                : "Create account"}
            {!pending && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          {isLogin ? (
            loginTab === "admin" ? (
              <>
                Not an admin?{" "}
                <button
                  type="button"
                  onClick={() => setLoginTab("reader")}
                  className="text-[var(--color-accent)] hover:underline"
                >
                  Use reader sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/signup" className="text-[var(--color-accent)] hover:underline">
                  Create an account
                </Link>
              </>
            )
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[var(--color-foreground)]/80">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="glass h-11 w-full rounded-xl px-4 text-sm outline-none placeholder:text-[var(--color-muted)] transition-[box-shadow,background-color] duration-150 focus:ring-2 focus:ring-[var(--color-primary)]"
      />
    </label>
  );
}

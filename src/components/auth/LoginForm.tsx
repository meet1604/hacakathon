"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithPassword } from "@/lib/auth/actions";
import { GoogleButton } from "./GoogleButton";

type Props = Readonly<{ next?: string }>;

export function LoginForm({ next = "/dashboard" }: Props) {
  const [state, action, isPending] = useActionState(signInWithPassword, {
    error: null,
  });

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton next={next} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[13px] text-text-3">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[14px] font-medium text-text-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-11 rounded-xl border border-border bg-bg px-4 text-[15px] text-text-1 placeholder:text-text-3 focus:border-primary-mid focus:outline-none focus:ring-3 focus:ring-primary/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[14px] font-medium text-text-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-11 rounded-xl border border-border bg-bg px-4 text-[15px] text-text-1 placeholder:text-text-3 focus:border-primary-mid focus:outline-none focus:ring-3 focus:ring-primary/10"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-xl border border-emergency/30 bg-emergency-bg px-4 py-3 text-[14px] text-emergency">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white shadow-sm transition-all hover:-translate-y-px hover:bg-primary-dark hover:shadow-md disabled:opacity-50"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-[14px] text-text-2">
        No account?{" "}
        <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}

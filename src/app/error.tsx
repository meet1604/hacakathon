"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[Global error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emergency-bg">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emergency"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h1 className="font-serif text-[28px] text-text-1">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-[15px] leading-[1.65] text-text-2">
        An unexpected error occurred. Don&apos;t worry — your health data is safe. Please try again.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-text-3">
          Ref: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={unstable_retry}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-6 text-[15px] font-medium text-text-2 shadow-sm transition-colors hover:text-text-1"
        >
          Go home
        </Link>
      </div>

      <p className="mt-6 text-[12px] text-text-3">
        If this keeps happening,{" "}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          report an issue
        </a>
        .
      </p>
    </div>
  );
}

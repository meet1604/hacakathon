"use client";

import Link from "next/link";

type Props = Readonly<{ onDismiss?: () => void }>;

export function FreeLimitModal({ onDismiss }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-limit-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl bg-surface p-6 shadow-xl">
        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-caution-bg">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-caution"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2
          id="free-limit-title"
          className="mb-1 font-serif text-[22px] text-text-1"
        >
          You&apos;ve used your free check.
        </h2>
        <p className="mb-5 text-[15px] leading-[1.65] text-text-2">
          Create a free account to get unlimited checks, save your history, and
          download doctor-ready PDFs.
        </p>

        <ul className="mb-6 flex flex-col gap-2.5">
          {[
            "Unlimited symptom checks — no daily cap",
            "Full check history saved automatically",
            "Download PDF summaries for your doctor",
            "Triage for family members too",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-[14px] text-text-1"
            >
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
                aria-hidden="true"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="mb-2.5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white shadow-sm transition-all hover:-translate-y-px hover:bg-primary-dark hover:shadow-md"
        >
          Create free account →
        </Link>
        <Link
          href="/login"
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl text-[15px] text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
        >
          Already have an account? Sign in
        </Link>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-3 w-full text-center text-[13px] text-text-3 underline underline-offset-2 hover:text-text-2"
          >
            Not now
          </button>
        )}
      </div>
    </div>
  );
}

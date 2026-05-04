"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Props = Readonly<{
  onDismiss?: () => void;
}>;

export function SignupWall({ onDismiss }: Props) {
  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-wall-title"
        className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onDismiss}
          aria-hidden="true"
        />

        {/* Card */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 26, stiffness: 340, delay: 0.05 }}
        >
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-selfcare-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-selfcare" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <h2 id="signup-wall-title" className="mb-1 font-serif text-[22px] text-text-1">
            Your result is ready.
          </h2>
          <p className="mb-5 text-[15px] leading-[1.65] text-text-2">
            Create a free account to view your full triage result, save it to
            your history, and download a doctor-ready PDF.
          </p>

          <ul className="mb-6 flex flex-col gap-2">
            {[
              "Save every check to your private history",
              "Download doctor-ready PDF summaries",
              "Add family members and triage for them",
              "See trends across your symptoms over time",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-text-1">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-selfcare">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="mb-2.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white shadow-sm transition-all hover:-translate-y-px hover:bg-primary-dark hover:shadow-md"
          >
            Sign up free
          </Link>
          <Link
            href="/login"
            className="flex min-h-11 w-full items-center justify-center rounded-xl text-[15px] text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
          >
            Already have an account? Sign in
          </Link>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-3 w-full text-center text-[13px] text-text-3 underline underline-offset-2 hover:text-text-2"
            >
              Continue without saving
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

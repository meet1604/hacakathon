"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "@/lib/auth/actions";
import Link from "next/link";
import { useTransition } from "react";

type Props = Readonly<{ email: string; name?: string }>;

export function UserMenu({ email, name }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  const displayName = name ?? email.split("@")[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[14px] text-text-1 shadow-sm transition-all hover:border-border-strong hover:shadow-md"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-white">
          {initials}
        </div>
        <span className="hidden max-w-[120px] truncate sm:block">{displayName}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-text-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-surface shadow-lg animate-slide-up"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-[13px] font-medium text-text-1 truncate">{displayName}</p>
            <p className="text-[12px] text-text-3 truncate">{email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[14px] text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
              Settings
            </Link>
            <button
              role="menuitem"
              disabled={isPending}
              onClick={() => {
                setOpen(false);
                startTransition(() => signOut());
              }}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-[14px] text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1 disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

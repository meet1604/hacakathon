"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/lib/auth/actions";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
};

const navItems: NavItem[] = [
  {
    id: "new",
    label: "New Check",
    href: "/dashboard/new",
    primary: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    href: "/dashboard/history",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "pdfs",
    label: "Reports",
    href: "/dashboard/pdfs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: "family",
    label: "Family",
    href: "/dashboard/family",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "insights",
    label: "Insights",
    href: "/dashboard/insights",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
];

type Props = Readonly<{
  email?: string;
  name?: string;
}>;

export function Sidebar({ email = "", name }: Props) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const displayName = name ?? email.split("@")[0] ?? "User";
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (email[0] ?? "U").toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-15 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary font-serif text-[15px] font-bold text-white">
          M
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.3px] text-text-1">
          MediTriage
        </span>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Beta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-text-3">
          Menu
        </p>

        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          if (item.primary) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="mb-3 flex min-h-10 items-center gap-2.5 rounded-[10px] bg-primary px-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-primary-dark"
              >
                {item.icon}
                {item.label}
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-9 items-center gap-2.5 rounded-[8px] px-3 text-[14px] transition-all ${
                isActive
                  ? "bg-primary/8 font-medium text-primary"
                  : "text-text-2 hover:bg-bg-tint hover:text-text-1"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-mid text-[12px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-text-1">{displayName}</p>
            <p className="truncate text-[11px] text-text-3">{email}</p>
          </div>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => signOut())}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors hover:bg-bg-tint hover:text-text-2 disabled:opacity-50"
            aria-label="Sign out"
            title="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

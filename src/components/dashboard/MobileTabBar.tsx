"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    id: "check",
    label: "Check",
    href: "/dashboard/new",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    href: "/dashboard/history",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    href: "/dashboard/pdfs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    href: "/dashboard/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex border-t border-border bg-surface md:hidden"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 px-2 pb-1.5 pt-2 text-[11px] font-medium transition-colors ${
              isActive ? "text-primary" : "text-text-3"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

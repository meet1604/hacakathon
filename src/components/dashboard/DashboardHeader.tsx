"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/new": "Symptom Check",
  "/dashboard/history": "Check History",
  "/dashboard/pdfs": "Saved PDFs",
  "/dashboard/family": "Family Members",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();

  // Match /dashboard/check/[id]
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/dashboard/check/") ? "Check Result" : "Dashboard");

  return (
    <div className="flex items-center gap-2 text-[13px] text-text-2">
      <span className="text-text-3">MediTriage</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
      </svg>
      <span className="font-semibold text-text-1">{title}</span>
    </div>
  );
}

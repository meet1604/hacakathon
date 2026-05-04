import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getAllSessions } from "@/lib/db/queries";
import { HistoryClient } from "@/components/dashboard/HistoryClient";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "History — MediTriage" };

export default async function HistoryPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessions = await getAllSessions(user?.id ?? null);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[24px] text-text-1">Check history</h1>
          <p className="mt-0.5 text-[14px] text-text-2">
            {sessions.length} {sessions.length === 1 ? "check" : "checks"} in total
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex h-9 items-center gap-2 rounded-[10px] bg-primary px-4 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-primary-dark"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New check
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden>
              <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 3"/><polyline points="12 7 12 12 14.5 14.5"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-1">No history yet</p>
            <p className="mt-0.5 text-[14px] text-text-2">Your completed checks will appear here.</p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            Start a check →
          </Link>
        </div>
      ) : (
        <HistoryClient sessions={sessions} />
      )}
    </div>
  );
}

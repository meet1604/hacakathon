import Link from "next/link";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getAllSessions, listReports } from "@/lib/db/queries";
import { ReportsClient } from "@/components/dashboard/ReportsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports — MediTriage" };

function getMonthlyFrequency(sessions: { created_at: string }[]): { label: string; count: number }[] {
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-IN", { month: "short" });
    const count = sessions.filter((s) => {
      const sd = new Date(s.created_at);
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
    }).length;
    months.push({ label, count });
  }
  return months;
}

export default async function PDFsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [sessions, reports] = await Promise.all([
    getAllSessions(user?.id ?? null),
    user?.id ? listReports(user.id) : Promise.resolve([]),
  ]);

  const totalChecks = reports.length;
  const selfCare = sessions.filter((s) => s.final_severity === "self_care").length;
  const clinic = sessions.filter(
    (s) => s.final_severity === "clinic_today" || s.final_severity === "clinic_soon"
  ).length;
  const emergency = sessions.filter((s) => s.final_severity === "emergency").length;

  const monthly = getMonthlyFrequency(sessions);
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);

  const rows = reports.map((report) => {
    const session = report.triage_sessions;
    return {
    id: report.id,
    sessionId: report.session_id,
    date: new Date(report.created_at).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }),
    firstSymptom:
      report.title ??
      session?.symptoms_summary ??
      (Array.isArray(session?.conversation) && session.conversation.length > 0
        ? String((session.conversation[0] as { content?: string }).content ?? "Symptom check").slice(0, 60)
        : "Symptom check"),
    severity: session?.final_severity ?? "self_care",
    doctorSummary: session?.doctor_summary ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[24px] text-text-1">Reports &amp; analytics</h1>
          <p className="mt-0.5 text-[14px] text-text-2">Doctor-ready summaries from your completed checks.</p>
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Saved reports",
            val: totalChecks,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            ),
            tone: "text-primary",
          },
          {
            label: "Self-care",
            val: selfCare,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
              </svg>
            ),
            tone: "text-selfcare",
          },
          {
            label: "Clinic visits",
            val: clinic,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            ),
            tone: "text-caution",
          },
          {
            label: "Emergency",
            val: emergency,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ),
            tone: "text-emergency",
          },
        ].map(({ label, val, icon, tone }) => (
          <div key={label} className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className={tone}>{icon}</div>
            <p className="text-[24px] font-bold leading-none text-text-1">{val}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">{label}</p>
          </div>
        ))}
      </div>

      {/* Frequency chart */}
      {sessions.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-text-1">Symptom trends</p>
              <p className="mt-0.5 text-[13px] text-text-2">Check frequency over the past 6 months</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-35 pt-4">
            {monthly.map(({ label, count }) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 4)}%`,
                    background: count > 0 ? "var(--color-primary)" : "var(--color-border)",
                    opacity: count > 0 ? 1 : 0.4,
                  }}
                  title={`${count} check${count !== 1 ? "s" : ""}`}
                />
                <span className="text-[11px] font-medium text-text-3">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden />
            <span className="text-[12px] text-text-2">Checks</span>
          </div>
        </div>
      )}

      {/* Reports table */}
      {totalChecks > 0 ? (
        <ReportsClient rows={rows} />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-1">No reports yet</p>
            <p className="mt-0.5 text-[14px] text-text-2">
              Open a past check and save it as a report to keep it here.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            Start a check →
          </Link>
        </div>
      )}
    </div>
  );
}

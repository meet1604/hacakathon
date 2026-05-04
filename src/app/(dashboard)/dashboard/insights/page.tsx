import Link from "next/link";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getAllSessions } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Insights — MediTriage" };

function getMonthlyData(sessions: { created_at: string; final_severity: string | null }[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString("en-IN", { month: "short" });
    const count = sessions.filter((s) => {
      const sd = new Date(s.created_at);
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
    }).length;
    return { label, count };
  });
}

function getRecentActivity(sessions: { id: string; created_at: string; final_severity: string | null; conversation: unknown }[]) {
  return sessions.slice(0, 5).map((s) => {
    const msg =
      Array.isArray(s.conversation) && s.conversation.length > 0
        ? String((s.conversation[0] as { content?: string }).content ?? "Symptom check").slice(0, 60)
        : "Symptom check";
    const severity = s.final_severity ?? "self_care";
    const timeAgo = (() => {
      const diff = Date.now() - new Date(s.created_at).getTime();
      const days = Math.floor(diff / 86_400_000);
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
      return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
    })();
    return { id: s.id, msg, severity, timeAgo };
  });
}

const SEV_DOT: Record<string, string> = {
  self_care: "bg-selfcare",
  clinic_today: "bg-caution",
  clinic_soon: "bg-caution",
  emergency: "bg-emergency",
};

const SEV_LABEL: Record<string, string> = {
  self_care: "Self-care result",
  clinic_today: "See a doctor",
  clinic_soon: "See a doctor",
  emergency: "Emergency referral",
};

const SEV_TEXT: Record<string, string> = {
  self_care: "text-selfcare",
  clinic_today: "text-caution",
  clinic_soon: "text-caution",
  emergency: "text-emergency",
};

export default async function InsightsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessions = await getAllSessions(user?.id ?? null);

  if (sessions.length < 3) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <h1 className="font-serif text-[24px] text-text-1">Health insights</h1>
          <p className="mt-0.5 text-[14px] text-text-2">Patterns and trends across your symptom checks.</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-tint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-1">Insights unlock after 3 checks</p>
            <p className="mt-0.5 text-[14px] text-text-2">
              You have {sessions.length}/3 so far. Complete {3 - sessions.length} more to see your health patterns.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            Start a check →
          </Link>
        </div>
      </div>
    );
  }

  const total = sessions.length;
  const severityCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const key = s.final_severity ?? "self_care";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const monthly = getMonthlyData(sessions);
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);
  const activity = getRecentActivity(sessions);

  const selfCarePct = Math.round(((severityCounts.self_care ?? 0) / total) * 100);
  const clinicPct = Math.round((((severityCounts.clinic_today ?? 0) + (severityCounts.clinic_soon ?? 0)) / total) * 100);
  const emergencyPct = Math.round(((severityCounts.emergency ?? 0) / total) * 100);

  const severityItems = [
    { key: "self_care", label: "Self-care", color: "bg-selfcare", textColor: "text-selfcare", pct: selfCarePct },
    { key: "clinic", label: "Clinic visits", color: "bg-caution", textColor: "text-caution", pct: clinicPct },
    { key: "emergency", label: "Emergency", color: "bg-emergency", textColor: "text-emergency", pct: emergencyPct },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[24px] text-text-1">Health insights</h1>
        <p className="mt-0.5 text-[14px] text-text-2">Based on {total} checks</p>
      </div>

      {/* Top row: stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total checks", val: total, color: "text-primary" },
          { label: "Self-care rate", val: `${selfCarePct}%`, color: "text-selfcare" },
          { label: "Emergency rate", val: `${emergencyPct}%`, color: "text-emergency" },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className={`text-[26px] font-bold leading-none ${color}`}>{val}</p>
            <p className="mt-1 text-[12px] text-text-3">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Frequency chart */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-0.5 text-[15px] font-semibold text-text-1">Check frequency</p>
          <p className="mb-4 text-[13px] text-text-2">Checks over the last 6 months</p>
          <div className="flex items-end gap-2 h-32">
            {monthly.map(({ label, count }) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max((count / maxCount) * 100, count > 0 ? 10 : 4)}%`,
                    background: count > 0 ? "var(--color-primary)" : "var(--color-border)",
                    opacity: count > 0 ? 1 : 0.35,
                  }}
                  title={`${count} check${count !== 1 ? "s" : ""}`}
                />
                <span className="text-[10px] font-medium text-text-3">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden />
            <span className="text-[12px] text-text-2">Checks</span>
          </div>
        </div>

        {/* Severity distribution */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-0.5 text-[15px] font-semibold text-text-1">Severity distribution</p>
          <p className="mb-4 text-[13px] text-text-2">Breakdown of all check outcomes</p>
          <div className="flex flex-col gap-4">
            {severityItems.map(({ key, label, color, textColor, pct }) => (
              <div key={key} className="flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden />
                <span className="w-24 shrink-0 text-[14px] text-text-1">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-border overflow-hidden" aria-hidden>
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span
                  className={`w-10 shrink-0 text-right text-[13px] font-semibold ${textColor}`}
                  style={{ opacity: pct === 0 ? 0.35 : 1 }}
                  aria-label={`${label}: ${pct}%`}
                >
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-[15px] font-semibold text-text-1">Recent activity</p>
          <Link
            href="/dashboard/history"
            className="text-[13px] font-medium text-primary hover:text-primary-dark"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {activity.map(({ id, msg, severity, timeAgo }) => (
            <Link
              key={id}
              href={`/dashboard/check/${id}`}
              className="flex items-start gap-3 px-5 py-4 hover:bg-bg/60 transition-colors"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEV_DOT[severity] ?? "bg-text-3"}`} aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-text-1">
                  <strong className={`font-medium ${SEV_TEXT[severity] ?? "text-text-1"}`}>
                    {SEV_LABEL[severity] ?? severity}
                  </strong>
                  {" — "}
                  <span className="text-text-2">{msg}</span>
                </p>
                <p className="mt-0.5 text-[12px] text-text-3">{timeAgo}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-text-3" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

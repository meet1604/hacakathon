import Link from "next/link";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getRecentSessions, getSessionStats, getAllSessions, listReports } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — MediTriage" };

function computeHealthScore(sessions: { final_severity: string | null }[]): number | null {
  if (sessions.length === 0) return null;
  const weights: Record<string, number> = {
    self_care: 100,
    clinic_soon: 60,
    clinic_today: 40,
    emergency: 0,
  };
  const sum = sessions.reduce((acc, s) => acc + (weights[s.final_severity ?? "self_care"] ?? 60), 0);
  return Math.round(sum / sessions.length);
}

const SEV_DOT: Record<string, string> = {
  self_care: "bg-selfcare",
  clinic_today: "bg-caution",
  clinic_soon: "bg-caution",
  emergency: "bg-emergency",
};
const SEV_BADGE: Record<string, string> = {
  self_care: "bg-selfcare-bg text-selfcare",
  clinic_today: "bg-caution-bg text-caution",
  clinic_soon: "bg-caution-bg text-caution",
  emergency: "bg-emergency-bg text-emergency",
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
const SEVERITY_RISK: Record<string, string> = {
  self_care: "Low",
  clinic_soon: "Moderate",
  clinic_today: "Moderate",
  emergency: "High",
};

function getMonthlyData(sessions: { created_at: string }[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString("en-IN", { month: "short" });
    const count = sessions.filter((s) => {
      const sd = new Date(s.created_at);
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
    }).length;
    return { label, count, isCurrent: i === 5 };
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StatCard({
  value,
  label,
  icon,
  tone,
  delta,
  deltaTone = "positive",
}: Readonly<{
  value: string;
  label: string;
  icon: React.ReactNode;
  tone?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
}>) {
  let deltaColor = "text-selfcare";
  if (deltaTone === "negative") deltaColor = "text-emergency";
  else if (deltaTone === "neutral") deltaColor = "text-text-3";
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className={tone ?? "text-primary"}>{icon}</div>
      <p className="text-[24px] font-bold leading-none text-text-1">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">{label}</p>
      {delta && <p className={`text-[12px] font-medium ${deltaColor}`}>{delta}</p>}
    </div>
  );
}

function computeGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function computeAvgSeverityTone(dominantSeverity: string | null): string {
  if (dominantSeverity === "emergency") return "text-emergency";
  if (dominantSeverity === "clinic_today" || dominantSeverity === "clinic_soon") return "text-caution";
  return "text-selfcare";
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const [recent, stats, all, reports] = await Promise.all([
    getRecentSessions(user?.id ?? null, 3),
    user?.id ? getSessionStats(user.id) : Promise.resolve({ total: 0, thisMonth: 0, dominantSeverity: null }),
    getAllSessions(user?.id ?? null),
    user?.id ? listReports(user.id) : Promise.resolve([]),
  ]);

  const healthScore = computeHealthScore(all);
  const selfCarePct = all.length
    ? Math.round((all.filter((s) => s.final_severity === "self_care").length / all.length) * 100)
    : 0;
  const now = new Date();
  const greeting = computeGreeting(now.getHours());

  const monthly = getMonthlyData(all);
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);

  const avgSeverityLabel = stats.dominantSeverity ? (SEVERITY_RISK[stats.dominantSeverity] ?? "Low") : "—";
  const avgSeverityTone = computeAvgSeverityTone(stats.dominantSeverity);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  const lastMonthCount = all.filter((s) => s.created_at >= prevMonthStart && s.created_at <= prevMonthEnd).length;
  const monthDelta = stats.thisMonth - lastMonthCount;
  let monthDeltaLabel: string;
  if (monthDelta > 0) monthDeltaLabel = `↑ ${monthDelta} vs last month`;
  else if (monthDelta < 0) monthDeltaLabel = `↓ ${Math.abs(monthDelta)} vs last month`;
  else monthDeltaLabel = "Same as last month";
  const healthScoreDelta = healthScore === null ? undefined : `Health score ${healthScore}/100`;

  const recentActivity = all.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[24px] text-text-1">
            {greeting}, {displayName}
          </h1>
          <p className="mt-0.5 text-[13px] text-text-2">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-primary-dark"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New check
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          value={stats.total > 99 ? "99+" : String(stats.total)}
          label="Total checks"
          delta={stats.total > 0 ? `+${stats.thisMonth} this month` : undefined}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
        />
        <StatCard
          value={String(stats.thisMonth)}
          label={`${now.toLocaleString("en-IN", { month: "short" })} checks`}
          delta={monthDeltaLabel}
          deltaTone={monthDelta >= 0 ? "positive" : "negative"}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          value={avgSeverityLabel}
          label="Avg severity"
          tone={avgSeverityTone}
          delta={healthScoreDelta}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
        />
        <StatCard
          value={String(reports.length)}
          label="Saved reports"
          delta={selfCarePct > 0 ? `${selfCarePct}% self-care` : undefined}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left: chart + recent checks */}
        <div className="flex flex-col gap-6">
          {/* Frequency chart */}
          {all.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-text-1">Check frequency</p>
                  <p className="mt-0.5 text-[13px] text-text-2">Symptom checks over 6 months</p>
                </div>
              </div>
              <div className="flex items-end gap-2 h-36">
                {monthly.map(({ label, count, isCurrent }) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 3)}%`,
                        background: isCurrent ? "var(--color-primary)" : "var(--color-primary-tint, #EBF3F0)",
                        opacity: count > 0 ? 1 : 0.3,
                      }}
                      title={`${count} check${count === 1 ? "" : "s"}`}
                    />
                    <span className="text-[10px] font-medium text-text-3">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[12px] text-text-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden="true" />
                  <span>Current month</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-primary/20" aria-hidden="true" />
                  <span>Previous months</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text-1">Recent activity</p>
              {stats.total > 0 && (
                <Link href="/dashboard/history" className="text-[13px] font-medium text-primary hover:text-primary-dark">
                  View all →
                </Link>
              )}
            </div>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-tint">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden>
                    <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 3"/><polyline points="12 7 12 12 14.5 14.5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-text-1">No activity yet</p>
                  <p className="mt-0.5 text-[13px] text-text-2">Your checks will appear here.</p>
                </div>
                <Link href="/dashboard/new" className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-dark">
                  Start a check →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentActivity.map((s) => {
                  const severity = s.final_severity ?? "self_care";
                  const msg =
                    Array.isArray(s.conversation) && s.conversation.length > 0
                      ? String((s.conversation[0] as { content?: string }).content ?? "Symptom check").slice(0, 55)
                      : "Symptom check";
                  return (
                    <Link
                      key={s.id}
                      href={`/dashboard/check/${s.id}`}
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
                        <p className="mt-0.5 text-[12px] text-text-3">{timeAgo(s.created_at)}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-text-3" aria-hidden>
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: quick actions + recent checks */}
        <div className="flex flex-col gap-6">
          {/* Recent checks */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border px-4 py-3.5">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-text-3">Recent checks</p>
            </div>
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[14px] text-text-2">No checks yet.</p>
                <Link href="/dashboard/new" className="mt-2 block text-[13px] font-medium text-primary hover:underline">Start your first →</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((s) => {
                  const severity = s.final_severity ?? "self_care";
                  const msg =
                    Array.isArray(s.conversation) && s.conversation.length > 0
                      ? String((s.conversation[0] as { content?: string }).content ?? "").slice(0, 45)
                      : "Symptom check";
                  return (
                    <Link
                      key={s.id}
                      href={`/dashboard/check/${s.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-bg/60 transition-colors"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${SEV_DOT[severity] ?? "bg-text-3"}`} aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-medium text-text-1">{msg}</p>
                        <p className="text-[11px] text-text-3">{timeAgo(s.created_at)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEV_BADGE[severity] ?? "bg-bg-tint text-text-2"}`}>
                        {SEV_LABEL[severity]?.split(" ")[0] ?? severity}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-3">Quick actions</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "New symptom check", href: "/dashboard/new", color: "text-primary", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
                { label: "View all reports", href: "/dashboard/pdfs", color: "text-selfcare", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
                { label: "Manage family", href: "/dashboard/family", color: "text-caution", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              ].map(({ label, href, color, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-border px-3 text-[13px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
                >
                  <span className={color}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

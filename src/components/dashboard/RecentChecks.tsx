import Link from "next/link";

type Check = {
  id: string;
  date: string;
  firstSymptom: string;
  severity: string;
};

const SEVERITY_LABELS: Record<string, string> = {
  self_care: "Self-care",
  clinic_today: "See doctor today",
  clinic_soon: "See doctor soon",
  emergency: "Emergency",
};

const SEVERITY_TONE: Record<string, string> = {
  self_care: "bg-selfcare-bg text-selfcare",
  clinic_today: "bg-caution-bg text-caution",
  clinic_soon: "bg-caution-bg text-caution",
  emergency: "bg-emergency-bg text-emergency",
};

function SeverityBadge({ severity }: Readonly<{ severity: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${SEVERITY_TONE[severity] ?? "bg-bg-tint text-text-2"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${severity === "self_care" ? "bg-selfcare" : severity === "emergency" ? "bg-emergency" : "bg-caution"}`} />
      {SEVERITY_LABELS[severity] ?? severity}
    </span>
  );
}

type Props = Readonly<{
  checks: Check[];
}>;

export function RecentChecks({ checks }: Props) {
  if (checks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden="true">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-medium text-text-1">No checks yet</p>
          <p className="mt-0.5 text-[14px] text-text-2">Start your first symptom check to see your history here.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="mt-1 flex min-h-[40px] items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-primary-dark"
        >
          Start a check →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {checks.map((check) => (
        <Link
          key={check.id}
          href={`/dashboard/check/${check.id}`}
          className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-sm transition-all hover:border-border-strong hover:shadow-md"
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-[15px] font-medium text-text-1">
              {check.firstSymptom}
            </p>
            <p className="mt-0.5 text-[12px] text-text-3">{check.date}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SeverityBadge severity={check.severity} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}

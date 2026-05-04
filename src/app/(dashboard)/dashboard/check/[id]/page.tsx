import { createSupabaseServer } from "@/lib/db/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { SaveReportButton } from "@/components/dashboard/SaveReportButton";
import { getSessionById } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check result — MediTriage" };

const SEVERITY_LABEL: Record<string, string> = {
  self_care: "Self-care at home",
  clinic_today: "See a doctor soon",
  clinic_soon: "See a doctor soon",
  emergency: "Emergency — seek care now",
};

const SEVERITY_STYLE: Record<string, string> = {
  self_care: "bg-selfcare-bg border-selfcare/30 text-selfcare",
  clinic_today: "bg-caution-bg border-caution/30 text-caution",
  clinic_soon: "bg-caution-bg border-caution/30 text-caution",
  emergency: "bg-emergency text-white border-emergency",
};

type Props = Readonly<{ params: Promise<{ id: string }> }>;

export default async function CheckPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const session = await getSessionById(user.id, id);
  if (!session) notFound();

  const severity = session.final_severity ?? "self_care";
  const messages = Array.isArray(session.conversation) ? session.conversation : [];

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/history"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-text-2 transition-colors hover:bg-bg-tint"
          aria-label="Back to history"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="font-serif text-[22px] text-text-1">Check result</h1>
          <p className="text-[13px] text-text-3">
            {new Date(session.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SaveReportButton sessionId={session.id} />
          <PrintButton sessionId={session.id} />
        </div>
      </div>

      {/* Severity */}
      <div className={`flex items-center gap-4 rounded-xl border p-5 shadow-sm ${SEVERITY_STYLE[severity]}`}>
        <p className="text-[18px] font-semibold">{SEVERITY_LABEL[severity] ?? severity}</p>
      </div>

      {/* Summary */}
      {session.doctor_summary && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">Summary</p>
          <p className="text-[15px] leading-[1.65] text-text-1">{session.doctor_summary}</p>
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">Conversation</p>
          <div className="flex flex-col gap-2.5">
            {messages.map((msg: { role: string; content: string }, i: number) => (
              <div
                key={`${msg.role}-${i}-${msg.content.slice(0, 12)}`}
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[14px] leading-[1.55] ${
                  msg.role === "user"
                    ? "self-end bg-primary text-white"
                    : "self-start border border-border bg-bg text-text-1"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/dashboard/new"
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white shadow-sm hover:bg-primary-dark"
      >
        Start a new check
      </Link>
    </div>
  );
}

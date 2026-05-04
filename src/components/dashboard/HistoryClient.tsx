"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteSessionAction } from "@/lib/dashboard/actions";
import { useToast } from "@/components/ui/Toast";

type Session = {
  id: string;
  created_at: string;
  final_severity: string | null;
  conversation: unknown;
  doctor_summary: string | null;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "self_care", label: "Self-care" },
  { id: "clinic", label: "See doctor" },
  { id: "emergency", label: "Emergency" },
] as const;

const SEV_BADGE: Record<string, string> = {
  self_care: "bg-selfcare-bg text-selfcare",
  clinic_today: "bg-caution-bg text-caution",
  clinic_soon: "bg-caution-bg text-caution",
  emergency: "bg-emergency-bg text-emergency",
};

const SEV_LABEL: Record<string, string> = {
  self_care: "Self-care",
  clinic_today: "See doctor",
  clinic_soon: "See doctor",
  emergency: "Emergency",
};

const SEV_DOT: Record<string, string> = {
  self_care: "bg-selfcare",
  clinic_today: "bg-caution",
  clinic_soon: "bg-caution",
  emergency: "bg-emergency",
};

function getFirstMessage(conversation: unknown): string {
  if (!Array.isArray(conversation) || conversation.length === 0) return "Symptom check";
  const first = conversation[0] as { content?: string };
  return String(first.content ?? "Symptom check").slice(0, 70);
}

export function HistoryClient({ sessions }: { sessions: Session[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = sessions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "self_care") return s.final_severity === "self_care";
    if (filter === "clinic") return s.final_severity === "clinic_today" || s.final_severity === "clinic_soon";
    if (filter === "emergency") return s.final_severity === "emergency";
    return true;
  });

  function removeSession(sessionId: string) {
    setDeletingId(sessionId);
    startTransition(async () => {
      const result = await deleteSessionAction(sessionId);
      setDeletingId(null);
      if (result.ok) {
        toast({ type: "success", title: result.message ?? "Check removed" });
      } else {
        toast({ type: "error", title: "Could not remove check", message: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by severity">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`flex h-[34px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-all ${
              filter === f.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-text-2 hover:border-border-strong hover:text-text-1"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-[13px] text-text-3">
          {filtered.length} {filtered.length === 1 ? "check" : "checks"}
        </span>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[.05em] text-text-3">Date</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[.05em] text-text-3">Symptoms</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[.05em] text-text-3">Severity</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[.05em] text-text-3">Result</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <p className="text-[14px] font-medium text-text-1">No checks match this filter</p>
                    <p className="mt-1 text-[13px] text-text-2">Try selecting a different category above.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const severity = s.final_severity ?? "self_care";
                  const msg = getFirstMessage(s.conversation);
                  const date = new Date(s.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  });
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors"
                    >
                      <td className="px-5 py-4 text-[13px] whitespace-nowrap text-text-2">{date}</td>
                      <td className="px-5 py-4 max-w-[260px]">
                        <span className="block truncate text-[14px] text-text-1">{msg}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${SEV_BADGE[severity] ?? "bg-bg-tint text-text-2"}`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[severity] ?? "bg-text-3"}`} aria-hidden />
                          {SEV_LABEL[severity] ?? severity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-text-1">
                        {SEV_LABEL[severity] ?? severity}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/check/${s.id}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
                          >
                            View →
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeSession(s.id)}
                            disabled={isPending && deletingId === s.id}
                            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12px] font-medium text-text-2 transition-colors hover:border-emergency/40 hover:bg-emergency-bg hover:text-emergency disabled:opacity-50"
                          >
                            {deletingId === s.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[14px] font-medium text-text-1">No checks match this filter</p>
              <p className="mt-1 text-[13px] text-text-2">Try selecting a different category above.</p>
            </div>
          ) : (
            filtered.map((s) => {
              const severity = s.final_severity ?? "self_care";
              const msg = getFirstMessage(s.conversation);
              const date = new Date(s.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg/60 transition-colors"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${SEV_DOT[severity] ?? "bg-text-3"}`} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[14px] font-medium text-text-1">{msg}</p>
                    <p className="mt-0.5 text-[12px] text-text-3">{date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${SEV_BADGE[severity] ?? "bg-bg-tint text-text-2"}`}>
                    {SEV_LABEL[severity] ?? severity}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <Link
                      href={`/dashboard/check/${s.id}`}
                      className="flex h-8 items-center rounded-lg border border-border px-2.5 text-[12px] font-medium text-text-2"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeSession(s.id)}
                      disabled={isPending && deletingId === s.id}
                      className="flex h-8 items-center rounded-lg border border-border px-2.5 text-[12px] font-medium text-text-2 hover:bg-emergency-bg hover:text-emergency disabled:opacity-50"
                    >
                      {deletingId === s.id ? "..." : "Del"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

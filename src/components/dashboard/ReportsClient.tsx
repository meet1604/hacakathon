"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteReportAction } from "@/lib/dashboard/actions";
import { useToast } from "@/components/ui/Toast";

type ReportRow = {
  id: string;
  sessionId: string;
  date: string;
  firstSymptom: string;
  severity: string;
  doctorSummary: string | null;
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

const SEV_DOT: Record<string, string> = {
  self_care: "bg-selfcare",
  clinic_today: "bg-caution",
  clinic_soon: "bg-caution",
  emergency: "bg-emergency",
};

const SEV_LABEL: Record<string, string> = {
  self_care: "Self-care",
  clinic_today: "See doctor",
  clinic_soon: "See doctor",
  emergency: "Emergency",
};

const SEV_RESULT: Record<string, string> = {
  self_care: "Self-care at home",
  clinic_today: "Clinic visit",
  clinic_soon: "Clinic visit",
  emergency: "Emergency care",
};

export function ReportsClient({ rows }: { rows: ReportRow[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "self_care") return r.severity === "self_care";
    if (filter === "clinic") return r.severity === "clinic_today" || r.severity === "clinic_soon";
    if (filter === "emergency") return r.severity === "emergency";
    return true;
  });

  function removeReport(reportId: string) {
    setDeletingId(reportId);
    startTransition(async () => {
      const result = await deleteReportAction(reportId);
      setDeletingId(null);
      if (result.ok) {
        toast({ type: "success", title: result.message ?? "Report deleted" });
      } else {
        toast({ type: "error", title: "Could not delete report", message: result.error });
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      {/* Table header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <p className="text-[15px] font-semibold text-text-1">Check history</p>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-all ${
                filter === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-bg text-text-2 hover:border-border-strong hover:text-text-1"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg/50">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-3">Date</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-3">Symptoms</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-3">Severity</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-3">Result</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <p className="text-[14px] font-medium text-text-1">No reports match this filter</p>
                  <p className="mt-1 text-[13px] text-text-2">Try selecting a different category above.</p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                  <td className="px-5 py-4 text-[13px] whitespace-nowrap text-text-2">{r.date}</td>
                  <td className="px-5 py-4 max-w-[220px]">
                    <span className="block truncate text-[14px] text-text-1">{r.firstSymptom}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${SEV_BADGE[r.severity] ?? "bg-bg-tint text-text-2"}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[r.severity] ?? "bg-text-3"}`} aria-hidden />
                      {SEV_LABEL[r.severity] ?? r.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] font-medium text-text-1">
                    {SEV_RESULT[r.severity] ?? r.severity}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-selfcare-bg px-2.5 py-0.5 text-[11px] font-semibold text-selfcare">
                      <span className="h-1.5 w-1.5 rounded-full bg-selfcare" aria-hidden />
                      Resolved
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/check/${r.sessionId}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
                        title="View and print this report"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        PDF
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeReport(r.id)}
                        disabled={isPending && deletingId === r.id}
                        className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12px] font-medium text-text-2 transition-colors hover:border-emergency/40 hover:bg-emergency-bg hover:text-emergency disabled:opacity-50"
                      >
                        {deletingId === r.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[14px] font-medium text-text-1">No reports match this filter</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-4 py-4">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${SEV_DOT[r.severity] ?? "bg-text-3"}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-text-1">{r.firstSymptom}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${SEV_BADGE[r.severity] ?? "bg-bg-tint text-text-2"}`}>
                    {SEV_LABEL[r.severity] ?? r.severity}
                  </span>
                  <span className="text-[12px] text-text-3">{r.date}</span>
                </div>
              </div>
              <Link
                href={`/dashboard/check/${r.sessionId}`}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-text-2 hover:bg-bg-tint"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                PDF
              </Link>
              <button
                type="button"
                onClick={() => removeReport(r.id)}
                disabled={isPending && deletingId === r.id}
                className="flex h-8 shrink-0 items-center rounded-lg border border-border px-3 text-[12px] font-medium text-text-2 hover:bg-emergency-bg hover:text-emergency disabled:opacity-50"
              >
                {deletingId === r.id ? "..." : "Delete"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-[13px] text-text-2">{filtered.length} of {rows.length} reports</span>
        <p className="text-[12px] text-text-3">Click PDF to view and print any report</p>
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { saveReportAction } from "@/lib/dashboard/actions";
import { useToast } from "@/components/ui/Toast";

export function SaveReportButton({ sessionId }: Readonly<{ sessionId: string }>) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function save() {
    startTransition(async () => {
      const result = await saveReportAction(sessionId);
      if (result.ok) {
        toast({ type: "success", title: result.message ?? "Report saved" });
      } else {
        toast({ type: "error", title: "Could not save report", message: result.error });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={isPending}
      className="flex h-9 items-center gap-2 rounded-[10px] border border-border bg-surface px-3 text-[13px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1 disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      {isPending ? "Saving..." : "Save report"}
    </button>
  );
}

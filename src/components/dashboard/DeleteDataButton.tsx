"use client";

import { useTransition } from "react";
import { deleteAllUserDataAction } from "@/lib/dashboard/actions";
import { useToast } from "@/components/ui/Toast";

export function DeleteDataButton() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function deleteData() {
    const confirmed = globalThis.confirm(
      "Delete all saved checks, reports, and family members? This cannot be undone."
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteAllUserDataAction();
      if (result.ok) {
        toast({ type: "success", title: result.message ?? "Data deleted" });
      } else {
        toast({ type: "error", title: "Could not delete data", message: result.error });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={deleteData}
      disabled={isPending}
      className="shrink-0 flex h-9 items-center rounded-lg bg-emergency px-4 text-[13px] font-medium text-white transition-colors hover:bg-emergency/80 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete data"}
    </button>
  );
}

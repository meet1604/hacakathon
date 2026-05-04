"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

type Toggle = {
  id: string;
  label: string;
  desc: string;
  defaultChecked: boolean;
};

const TOGGLES: Toggle[] = [
  { id: "anon_data", label: "Share anonymised data", desc: "Help improve AI accuracy", defaultChecked: true },
  { id: "email_reminders", label: "Email reminders", desc: "Weekly health check prompts", defaultChecked: true },
  { id: "sms_alerts", label: "SMS alerts", desc: "Urgent notifications only", defaultChecked: false },
];

function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-border-strong"
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function ProfileClient() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.id, t.defaultChecked]))
  );
  const { toast } = useToast();

  function toggle(id: string) {
    setState((prev) => {
      const next = !prev[id];
      const label = TOGGLES.find((t) => t.id === id)?.label ?? id;
      toast({ type: "success", title: `${label} ${next ? "enabled" : "disabled"}` });
      return { ...prev, [id]: next };
    });
  }

  return (
    <div className="flex flex-col">
      {TOGGLES.map((t, i) => (
        <div
          key={t.id}
          className={`flex items-center justify-between gap-4 py-3.5 ${
            i < TOGGLES.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <label htmlFor={t.id} className="cursor-pointer">
            <p className="text-[14px] font-medium text-text-1">{t.label}</p>
            <p className="text-[12px] text-text-2">{t.desc}</p>
          </label>
          <ToggleSwitch
            id={t.id}
            checked={state[t.id] ?? false}
            onChange={() => toggle(t.id)}
          />
        </div>
      ))}
    </div>
  );
}

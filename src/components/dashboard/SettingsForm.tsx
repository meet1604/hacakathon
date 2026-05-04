"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateProfileAction } from "@/lib/dashboard/actions";
import { useToast } from "@/components/ui/Toast";
import type { ProfileRow } from "@/lib/db/queries";

type Props = Readonly<{
  profile: ProfileRow | null;
  name: string;
  email: string;
}>;

const initialState = { ok: true as const };

export function SettingsForm({ profile, name, email }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const wasPending = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!wasPending.current || isPending) {
      wasPending.current = isPending;
      return;
    }
    wasPending.current = false;
    if (state.ok) {
      toast({ type: "success", title: state.message ?? "Settings saved" });
    } else {
      toast({ type: "error", title: "Could not save settings", message: state.error });
    }
  }, [isPending, state, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="full_name" className="text-[13px] font-medium text-text-1">Full name</label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={profile?.full_name ?? name}
            placeholder="Your name"
            className="h-10 rounded-[10px] border border-border bg-bg px-3 text-[14px] text-text-1 placeholder:text-text-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-text-1">Email address</label>
          <input
            id="email"
            defaultValue={email}
            readOnly
            className="h-10 cursor-not-allowed rounded-[10px] border border-border bg-bg px-3 text-[14px] text-text-2 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferred_language" className="text-[13px] font-medium text-text-1">Preferred language</label>
          <select
            id="preferred_language"
            name="preferred_language"
            defaultValue={profile?.preferred_language ?? "en-IN"}
            className="h-10 rounded-[10px] border border-border bg-bg px-3 text-[14px] text-text-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="ta-IN">Tamil</option>
            <option value="te-IN">Telugu</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="timezone" className="text-[13px] font-medium text-text-1">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={profile?.timezone ?? "Asia/Kolkata"}
            className="h-10 rounded-[10px] border border-border bg-bg px-3 text-[14px] text-text-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chronic_conditions" className="text-[13px] font-medium text-text-1">Chronic conditions</label>
          <input
            id="chronic_conditions"
            name="chronic_conditions"
            defaultValue={profile?.chronic_conditions ?? ""}
            placeholder="e.g. Asthma, Type 2 diabetes"
            className="h-10 rounded-[10px] border border-border bg-bg px-3 text-[14px] text-text-1 placeholder:text-text-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="known_allergies" className="text-[13px] font-medium text-text-1">Known allergies</label>
          <input
            id="known_allergies"
            name="known_allergies"
            defaultValue={profile?.known_allergies ?? ""}
            placeholder="e.g. Penicillin, peanuts"
            className="h-10 rounded-[10px] border border-border bg-bg px-3 text-[14px] text-text-1 placeholder:text-text-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="current_medications" className="text-[13px] font-medium text-text-1">Current medications</label>
        <textarea
          id="current_medications"
          name="current_medications"
          rows={3}
          defaultValue={profile?.current_medications ?? ""}
          placeholder="List any medications you're currently taking"
          className="resize-none rounded-[10px] border border-border bg-bg px-3 py-2.5 text-[14px] text-text-1 placeholder:text-text-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-3">
        {[
          ["anonymized_data", "Share anonymised data", profile?.anonymized_data ?? true],
          ["notification_email", "Email reminders", profile?.notification_email ?? true],
          ["sms_alerts", "SMS alerts", profile?.sms_alerts ?? false],
        ].map(([id, label, checked]) => (
          <label key={String(id)} className="flex items-center gap-2 rounded-[10px] border border-border bg-bg px-3 py-2 text-[13px] text-text-2">
            <input
              type="checkbox"
              name={String(id)}
              defaultChecked={Boolean(checked)}
              className="h-4 w-4 accent-primary"
            />
            {label}
          </label>
        ))}
      </div>

      {!state.ok && (
        <p role="alert" className="rounded-xl border border-emergency/30 bg-emergency-bg px-4 py-3 text-[14px] text-emergency">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}

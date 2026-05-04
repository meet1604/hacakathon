import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getAllSessions, getProfile } from "@/lib/db/queries";
import { signOut } from "@/lib/auth/actions";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { DeleteDataButton } from "@/components/dashboard/DeleteDataButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — MediTriage" };

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [sessions, profile] = await Promise.all([
    getAllSessions(user?.id ?? null),
    user?.id ? getProfile(user.id) : Promise.resolve(null),
  ]);

  const name =
    profile?.full_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    "";

  const initials = name
    ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "U").toUpperCase();

  const displayName = name || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-[24px] text-text-1">Profile &amp; settings</h1>
        <p className="mt-0.5 text-[14px] text-text-2">Manage your account and preferences.</p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Profile card */}
          <div className="flex flex-col items-center rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-mid font-serif text-[28px] text-white">
              {initials}
            </div>
            <p className="mt-4 text-[18px] font-semibold text-text-1">{displayName}</p>
            <p className="mt-0.5 text-[13px] text-text-2">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-selfcare-bg px-2.5 py-1 text-[11px] font-semibold text-selfcare">
                <span className="h-1.5 w-1.5 rounded-full bg-selfcare" aria-hidden />
                Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                Free plan
              </span>
            </div>
            {/* Stats */}
            <div className="mt-5 grid w-full grid-cols-2 gap-3">
              {[
                { val: sessions.length, label: "Checks" },
                { val: sessions.filter((s) => s.doctor_summary).length, label: "Reports" },
              ].map(({ val, label }) => (
                <div key={label} className="rounded-[10px] bg-bg py-3 text-center">
                  <p className="text-[22px] font-bold text-text-1">{val}</p>
                  <p className="mt-0.5 text-[11px] text-text-3">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Saved preferences summary */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-text-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
              </svg>
              Privacy &amp; data
            </p>
            <div className="space-y-2 text-[13px] text-text-2">
              <p>Email reminders: <strong className="text-text-1">{profile?.notification_email ?? true ? "On" : "Off"}</strong></p>
              <p>Anonymised data: <strong className="text-text-1">{profile?.anonymized_data ?? true ? "On" : "Off"}</strong></p>
              <p>SMS alerts: <strong className="text-text-1">{profile?.sms_alerts ? "On" : "Off"}</strong></p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Personal info */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="mb-4 flex items-center gap-2 border-b border-border pb-4 text-[13px] font-semibold text-text-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Personal information
            </p>
            <SettingsForm profile={profile} name={name} email={user?.email ?? ""} />
          </div>

          {/* Medical disclaimer */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-text-3">
              Medical disclaimer
            </p>
            <p className="text-[13px] leading-[1.65] text-text-2">
              MediTriage provides informational guidance only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions. In an emergency, call{" "}
              <a href="tel:108" className="font-semibold text-emergency hover:underline">108</a>{" "}
              immediately.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-[15px] font-medium text-text-2 shadow-sm transition-all hover:border-emergency/40 hover:bg-emergency-bg hover:text-emergency"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </form>

            {/* Danger zone */}
            <div className="rounded-xl border border-emergency/20 bg-surface p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-emergency">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Danger zone
              </p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-text-1">Delete dashboard data</p>
                  <p className="text-[13px] text-text-2">Remove saved checks, reports, and family members. Your login remains active.</p>
                </div>
                <DeleteDataButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

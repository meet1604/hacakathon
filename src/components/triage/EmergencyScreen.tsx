"use client";

import type { TriageDecision } from "@/lib/triage/types";

type EmergencyScreenProps = Readonly<{
  response: TriageDecision;
  onBack: () => void;
  mode?: "anonymous" | "authed";
}>;

const EMERGENCY_NUMBER = "108";

const NEARBY_HOSPITALS = [
  { name: "City General Hospital", dist: "0.8 km", type: "Government" },
  { name: "Apollo Emergency Centre", dist: "1.4 km", type: "Private" },
  { name: "District Medical College", dist: "2.1 km", type: "Government" },
];

const FIRST_AID_STEPS = [
  {
    n: "1",
    text: "Stay calm and stay with the patient",
    sub: "Panic worsens symptoms — keep them still and reassured",
  },
  {
    n: "2",
    text: "Call 108 immediately",
    sub: "State your location clearly. Stay on the line.",
  },
  {
    n: "3",
    text: "Do not give food, water, or medication",
    sub: "Unless instructed by the dispatcher",
  },
  {
    n: "4",
    text: "Unlock the door and wait visible",
    sub: "So emergency responders can reach you quickly",
  },
];

export function EmergencyScreen({ response, onBack }: EmergencyScreenProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-1 flex-col overflow-hidden"
    >
      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* ── Left: main emergency content ──────────────────��───────── */}
        <div className="flex flex-col gap-5 bg-emergency-bg px-5 py-7 md:flex-1 md:overflow-y-auto md:px-10 md:py-10">
          {/* Alert banner */}
          <div className="flex items-center gap-3 rounded-xl bg-emergency px-5 py-4 text-white animate-pulse-emergency">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-[15px] font-semibold">
              Emergency — Seek care immediately
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-serif text-[36px] leading-[1.12] text-text-1 md:text-[48px]">
              Seek emergency care{" "}
              <em className="text-emergency" style={{ fontStyle: "italic" }}>
                immediately.
              </em>
            </h1>
            <p className="mt-3 max-w-md text-[16px] leading-[1.7] text-text-2">
              Your symptoms may indicate a{" "}
              <strong className="text-text-1">serious condition</strong> requiring
              urgent medical attention. Do not wait.
            </p>
          </div>

          {/* Primary CTA: Call 108 */}
          <a
            href={`tel:${EMERGENCY_NUMBER}`}
            className="group flex w-full max-w-sm items-center gap-4 rounded-xl bg-emergency px-6 py-4 text-white shadow-[0_4px_24px_rgba(178,58,58,.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(178,58,58,.45)] active:scale-[.98]"
            aria-label={`Call ${EMERGENCY_NUMBER} — National Ambulance Service`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <p className="text-[24px] font-bold leading-none">
                Call {EMERGENCY_NUMBER}
              </p>
              <p className="mt-1 text-[13px] text-white/75">
                National Ambulance Service
              </p>
            </div>
          </a>

          {/* Secondary actions */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <a
              href="https://www.google.com/maps/search/emergency+room+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border-2 border-emergency px-4 py-3 text-[14px] font-medium text-emergency transition-colors hover:bg-emergency-bg/80"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Find nearest ER
            </a>
            <div className="flex items-center gap-2.5 rounded-xl border-2 border-emergency/40 px-4 py-3 text-[14px] text-text-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Ask someone to drive you now
            </div>
          </div>

          {/* Red flags observed */}
          {response.red_flags.length > 0 && (
            <div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.07em] text-emergency/60">
                Warning signs observed
              </p>
              <div className="flex flex-col gap-2">
                {response.red_flags.map((flag) => (
                  <div
                    key={flag.category}
                    className="flex items-center gap-3 rounded-[10px] border border-emergency/20 bg-surface px-4 py-3"
                  >
                    <div className="h-2 w-2 shrink-0 rounded-full bg-emergency" />
                    <span className="text-[14px] font-medium text-text-1">
                      {flag.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dismiss */}
          <button
            onClick={onBack}
            className="mt-2 self-start text-[13px] text-text-3 underline underline-offset-2 transition-colors hover:text-text-2"
          >
            I&apos;ve called for help — go back
          </button>
        </div>

        {/* ── Right: info sidebar (desktop only) ───────────��─────────── */}
        <aside className="hidden border-l border-emergency/15 bg-surface md:flex md:w-80 md:shrink-0 md:flex-col md:gap-6 md:overflow-y-auto md:px-6 md:py-8 lg:w-96">
          {/* Nearby hospitals */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
              Nearby emergency care
            </p>
            <div className="flex flex-col gap-2">
              {NEARBY_HOSPITALS.map((h) => (
                <a
                  key={h.name}
                  href="https://www.google.com/maps/search/emergency+room+near+me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[10px] border border-border p-3 transition-all hover:border-emergency/30 hover:bg-emergency-bg"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-emergency-bg text-emergency">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 6v4M10 8h4" /><rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-medium text-text-1">{h.name}</p>
                    <p className="text-[12px] text-text-2">
                      {h.dist} · {h.type}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-3" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* First aid steps */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
              While you wait for help
            </p>
            <div className="flex flex-col">
              {FIRST_AID_STEPS.map((step, i) => (
                <div
                  key={step.n}
                  className={`flex gap-3 py-3 ${i < FIRST_AID_STEPS.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emergency-bg text-[12px] font-bold text-emergency">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-text-1">{step.text}</p>
                    <p className="mt-0.5 text-[12px] text-text-2">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Disclaimer */}
          <p className="text-[12px] leading-[1.6] text-text-3">
            This AI tool does not replace emergency services. Always call 108 in a medical emergency.
          </p>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { TriageDecision, Message } from "@/lib/triage/types";
import { TopBar } from "@/components/shared/TopBar";
import { useToast } from "@/components/ui/Toast";

const MAPS_URL = "https://www.google.com/maps/search/clinic+near+me";

type SeverityResultProps = Readonly<{
  response: TriageDecision;
  messages: Message[];
  onReset: () => void;
  showDownload?: boolean;
  showNewCheck?: boolean;
  mode?: "anonymous" | "authed";
  sessionId?: string | null;
}>;

export function SeverityResult({
  response,
  messages,
  onReset,
  showDownload = true,
  showNewCheck = true,
  mode = "anonymous",
  sessionId,
}: SeverityResultProps) {
  const { severity, reasoning, red_flags, suggested_otc } = response;
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  function handlePrint() {
    setIsPrinting(true);
    toast({ type: "info", title: "Preparing PDF…", message: "Your report is being generated." });
    setTimeout(() => {
      globalThis.print();
      setIsPrinting(false);
      toast({ type: "success", title: "Report ready", message: "Use your browser's print dialog to save as PDF." });
    }, 300);
  }

  const isSelfCare = severity === "self_care";
  const isClinicToday = severity === "clinic_today";
  const isClinicSoon = severity === "clinic_soon";
  const isDoctor = isClinicToday || isClinicSoon;

  const userMessages = messages.filter((m) => m.role === "user");

  const content = (
    <motion.div
      className="flex flex-col gap-4 lg:flex-row lg:gap-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* ── Main column ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Severity hero */}
        <SeverityHero severity={severity} />

        {/* Reasoning summary */}
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{
            borderColor: isDoctor ? "rgba(198,139,60,.25)" : undefined,
            backgroundColor: isDoctor ? "var(--color-caution-bg)" : "var(--color-surface)",
          }}
        >
          <p className="text-[15px] leading-[1.65] text-text-1">{reasoning}</p>
        </div>

        {/* Doctor result: urgency timeline */}
        {isDoctor && (
          <>
            <SectionLabel>Urgency timeline</SectionLabel>
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex gap-3 border-b border-border pb-3">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-caution" />
                <div className="text-[14px]">
                  <strong className="text-text-1">
                    {isClinicToday ? "Within 24 hours" : "Within a week"}
                  </strong>
                  <span className="mt-0.5 block text-[13px] text-text-2">
                    {isClinicToday
                      ? "Book a clinic appointment or visit a PHC"
                      : "Schedule a non-urgent appointment with your GP"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emergency" />
                <div className="text-[14px]">
                  <strong className="text-text-1">Go to emergency if</strong>
                  <span className="mt-0.5 block text-[13px] text-text-2">
                    Breathing difficulty, confusion, or fever above 104°F
                  </span>
                </div>
              </div>
            </div>

            <SectionLabel>Recommended specialist</SectionLabel>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-bg-tint text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-text-1">General Physician / GP</p>
                <p className="text-[12px] text-text-2">Available at your nearest PHC or clinic</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </>
        )}

        {/* What to tell the doctor */}
        {isDoctor && userMessages.length > 0 && (
          <>
            <SectionLabel>What to tell the doctor</SectionLabel>
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              {userMessages.map((m, i) => (
                <div
                  key={`${m.role}-${i}-${m.content.slice(0, 8)}`}
                  className={`flex items-start gap-2.5 py-2 text-[14px] text-text-1 ${i < userMessages.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-selfcare">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="leading-[1.55]">{m.content}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Red flags */}
        {red_flags.length > 0 && (
          <>
            <SectionLabel>Flags identified</SectionLabel>
            <div className="rounded-xl border border-caution/25 bg-caution-bg p-4 shadow-sm">
              {red_flags.map((f, i) => (
                <div
                  key={f.category}
                  className={`flex items-start gap-2 py-2 text-[13px] text-text-1 ${i < red_flags.length - 1 ? "border-b border-caution/20" : ""}`}
                >
                  <span className="mt-0.5 shrink-0 rounded-full bg-caution/15 px-2 py-0.5 text-[11px] font-semibold text-caution">
                    {f.category}
                  </span>
                  <span className="leading-[1.55]">{f.description}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Self-care: OTC suggestions */}
        {isSelfCare && suggested_otc && suggested_otc.length > 0 && (
          <>
            <SectionLabel>Suggested OTC remedies</SectionLabel>
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              {suggested_otc.map((otc, i) => (
                <div key={otc.name} className={`flex gap-3 py-2.5 ${i < suggested_otc.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-bg-tint text-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L18.5 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-text-1">{otc.name}</p>
                    <p className="text-[13px] text-text-2">{otc.purpose}</p>
                    <p className="mt-1 text-[12px] text-caution">⚠ {otc.caution}</p>
                  </div>
                </div>
              ))}
              <p className="mt-2 text-[12px] italic text-text-3">
                Always confirm with a pharmacist before taking new medication.
              </p>
            </div>
          </>
        )}

        {/* Self-care checklist */}
        {isSelfCare && (
          <>
            <SectionLabel>Care checklist</SectionLabel>
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              {["Rest — aim for 8+ hours sleep", "Drink 2–3 L of fluids daily", "Monitor temperature every 4 hours"].map((item, i, arr) => (
                <div key={item} className={`flex items-start gap-2.5 py-2 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-selfcare">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[14px] leading-[1.55] text-text-1">{item}</span>
                </div>
              ))}
              <div className="flex items-start gap-2.5 py-2">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border" />
                <span className="text-[14px] leading-[1.55] text-text-2">Return if fever exceeds 104°F or lasts &gt;3 days</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Actions sidebar (stacks below on mobile, right col on desktop) */}
      <div className="flex flex-col gap-3 lg:w-64 lg:shrink-0">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
            Recommended action
          </p>

          {isClinicToday && (
            <button
              onClick={() => globalThis.open(MAPS_URL, "_blank", "noopener,noreferrer")}
              className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-caution text-[15px] font-medium text-white shadow-sm transition-all hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Find nearest clinic
            </button>
          )}
          {isClinicSoon && (
            <button
              onClick={() => globalThis.open(MAPS_URL, "_blank", "noopener,noreferrer")}
              className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white shadow-sm transition-all hover:bg-primary-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule appointment
            </button>
          )}
          {isSelfCare && (
            <div className="flex items-center gap-2 rounded-xl bg-selfcare-bg px-4 py-3 text-[14px] font-medium text-selfcare">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
              </svg>
              Rest & self-care at home
            </div>
          )}

          {/* PDF download */}
          {showDownload ? (
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              aria-label="Download doctor PDF report"
              className="mt-3 flex w-full min-h-10 items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-transparent text-[14px] font-medium text-primary transition-all hover:bg-selfcare-bg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {isPrinting ? "Preparing…" : "Download doctor's PDF"}
            </button>
          ) : (
            <p className="mt-3 text-center text-[12px] text-text-3">
              <a href="/signup" className="font-medium text-primary underline underline-offset-2">
                Sign up free
              </a>{" "}
              to download doctor-ready PDF
            </p>
          )}

          {showNewCheck && (
            <button
              onClick={onReset}
              className="mt-2 flex w-full min-h-10 items-center justify-center rounded-xl text-[14px] text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
            >
              Start a new check
            </button>
          )}
          {mode === "authed" && sessionId && (
            <Link
              href={`/dashboard/check/${sessionId}`}
              className="mt-1 flex w-full min-h-10 items-center justify-center gap-1.5 rounded-xl text-[13px] text-primary transition-colors hover:bg-selfcare-bg"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 3"/><polyline points="12 7 12 12 14.5 14.5"/>
              </svg>
              View in history
            </Link>
          )}
        </div>

        {/* Disclaimer */}
        <p className="rounded-xl border border-border bg-surface p-3 text-[12px] leading-[1.6] text-text-3">
          AI guidance only — not a substitute for professional medical advice. Always consult a qualified healthcare provider.
        </p>
      </div>
    </motion.div>
  );

  // ── Authed mode: render directly in dashboard content ────────────
  if (mode === "authed") {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-5 md:px-6">
          {/* Inline back button for authed mode */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={onReset}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
              aria-label="Start new check"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5m7-7-7 7 7 7" />
              </svg>
            </button>
            <h2 className="font-serif text-[20px] text-text-1">Your triage result</h2>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // ── Anonymous mode: full-page with TopBar ─────────────────────────
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <TopBar title="Your result" back onBack={onReset} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4 lg:max-w-4xl lg:px-6 lg:py-6">
          {content}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
      {children}
    </p>
  );
}

type SeverityHeroProps = Readonly<{ severity: string }>;

function SeverityHero({ severity }: SeverityHeroProps) {
  const configs: Record<string, { tone: string; icon: React.ReactNode; title: string; subtitle: string }> = {
    self_care: {
      tone: "selfcare",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "Self-care at home",
      subtitle: "Low severity · Monitor for 3–5 days",
    },
    clinic_today: {
      tone: "caution",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: "See a doctor today",
      subtitle: "Moderate severity · Within 24 hours",
    },
    clinic_soon: {
      tone: "caution",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: "See a doctor soon",
      subtitle: "Moderate severity · Within a week",
    },
    emergency: {
      tone: "emergency",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: "Emergency — seek care now",
      subtitle: "High severity · Call 108 immediately",
    },
  };

  const cfg = configs[severity] ?? configs.clinic_today;

  const toneStyles: Record<string, string> = {
    selfcare: "bg-selfcare-bg border-selfcare/30 text-selfcare",
    caution: "bg-caution-bg border-caution/30 text-caution",
    emergency: "bg-emergency text-white border-emergency",
  };

  const iconBg: Record<string, string> = {
    selfcare: "bg-white/50",
    caution: "bg-white/50",
    emergency: "bg-white/20",
  };

  return (
    <div className={`flex items-center gap-4 rounded-xl border p-5 shadow-sm ${toneStyles[cfg.tone]}`}>
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg[cfg.tone]}`}>
        {cfg.icon}
      </div>
      <div>
        <p className="text-[18px] font-semibold leading-tight">{cfg.title}</p>
        <p className="mt-0.5 text-[13px] opacity-80">{cfg.subtitle}</p>
      </div>
    </div>
  );
}

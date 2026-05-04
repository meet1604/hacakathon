"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import type { Message, TriageResponse } from "@/lib/triage/schema";
import type { FamilyMemberRow } from "@/lib/db/queries";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { FollowupQuestions } from "./FollowupQuestions";
import { SeverityResult } from "./SeverityResult";
import { EmergencyScreen } from "./EmergencyScreen";
import { VoiceInputButton } from "./VoiceInputButton";
import { SignupWall } from "@/components/auth/SignupWall";
import { FreeLimitModal } from "@/components/auth/FreeLimitModal";

const SYMPTOM_CHIPS = [
  "Fever & chills",
  "Headache",
  "Chest pain",
  "Cough",
  "Stomach pain",
  "Dizziness",
];

const LANG_OPTIONS = [
  { code: "en-IN", label: "EN" },
  { code: "hi-IN", label: "हिं" },
  { code: "ta-IN", label: "தமி" },
  { code: "te-IN", label: "తె" },
];

const LANG_NAMES: Record<string, string> = {
  "en-IN": "English",
  "hi-IN": "Hindi",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
};

function getRoundLabel(messages: Message[]): string {
  const userCount = messages.filter((m) => m.role === "user").length;
  if (userCount === 0) return "";
  if (userCount === 1) return "Step 1 of 3 — Describing symptoms";
  if (userCount === 2) return "Step 2 of 3 — Gathering details";
  return "Step 3 of 3 — Finalising assessment";
}

function getProgressPct(messages: Message[]): number {
  const userCount = messages.filter((m) => m.role === "user").length;
  return Math.min(userCount * 33, 99);
}

type LangToggleProps = Readonly<{
  lang: string;
  setLang: (l: string) => void;
  compact?: boolean;
}>;

function LangToggle({ lang, setLang, compact = false }: LangToggleProps) {
  return (
    <fieldset
      className={`flex overflow-hidden rounded-full border border-border bg-bg ${compact ? "scale-90 origin-right" : ""}`}
      aria-label="Select language"
    >
      <legend className="sr-only">Language</legend>
      {LANG_OPTIONS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 text-[11px] font-medium transition-all ${
            lang === l.code
              ? "bg-primary text-white"
              : "text-text-2 hover:text-text-1"
          }`}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </fieldset>
  );
}

type Props = Readonly<{
  mode?: "anonymous" | "authed";
  familyMembers?: FamilyMemberRow[];
}>;

export function TriageChat({ mode = "anonymous", familyMembers = [] }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<TriageResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState("en-IN");
  const [showSignupWall, setShowSignupWall] = useState(false);
  const [showFreeLimitModal, setShowFreeLimitModal] = useState(false);
  const [lastInput, setLastInput] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedMember = familyMembers.find((m) => m.id === selectedMemberId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, response, isPending]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");
    setError(null);
    setResponse(null);
    setLastInput(trimmed);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            language: LANG_NAMES[lang] ?? "English",
            ...(sessionId ? { sessionId } : {}),
            ...(selectedMember
              ? {
                  memberContext: {
                    nickname: selectedMember.nickname,
                    ageBand: selectedMember.age_band ?? undefined,
                    knownConditions: selectedMember.known_conditions ?? undefined,
                  },
                }
              : {}),
          }),
        });
        const json = (await res.json()) as
          | { ok: true; data: TriageResponse & { sessionId?: string | null } }
          | { ok: false; error: { code: string; message: string } };

        if (!json.ok) {
          if (json.error.code === "FREE_LIMIT_REACHED") {
            setShowFreeLimitModal(true);
            // Remove the last user message so the UI stays clean
            setMessages(messages);
            return;
          }
          if (json.error.code === "AI_TIMEOUT") {
            setError("The AI took too long to respond. Please try again.");
          } else if (json.error.code === "RATE_LIMITED") {
            setError("Too many requests. Please wait a moment before trying again.");
          } else {
            setError(json.error.message);
          }
          return;
        }

        if (json.data.sessionId) setSessionId(json.data.sessionId);
        setResponse(json.data);
        if (
          mode === "anonymous" &&
          json.data.action === "triage" &&
          json.data.severity !== "emergency"
        ) {
          setShowSignupWall(true);
        }
        if (json.data.action === "ask_followup") {
          setMessages([
            ...newMessages,
            { role: "assistant", content: json.data.reasoning },
          ]);
        }
      } catch {
        setError("Connection lost. Check your internet and try again.");
      }
    });
  }

  function retry() {
    if (!lastInput) return;
    setError(null);
    // Remove last user message if it was added before the error
    const cleanMessages = messages.filter((_, i) => i < messages.length - 1 || messages[messages.length - 1]?.role !== "user");
    setMessages(cleanMessages);
    send(lastInput);
  }

  function reset() {
    setMessages([]);
    setResponse(null);
    setError(null);
    setInput("");
    setShowSignupWall(false);
    setShowFreeLimitModal(false);
    setLastInput("");
    setSelectedMemberId(null);
    setSessionId(null);
  }

  // Emergency always overrides everything — safety before conversion
  if (response?.action === "triage" && response.severity === "emergency") {
    return <EmergencyScreen response={response} onBack={reset} mode={mode} />;
  }

  // Final triage result
  if (response?.action === "triage") {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <SeverityResult
          response={response}
          messages={messages}
          onReset={reset}
          showDownload={mode === "authed"}
          showNewCheck={mode === "authed"}
          mode={mode}
          sessionId={sessionId}
        />
        {showSignupWall && (
          <SignupWall onDismiss={() => setShowSignupWall(false)} />
        )}
      </div>
    );
  }

  const hasMessages = messages.length > 0;
  const roundLabel = getRoundLabel(messages);
  const progressPct = getProgressPct(messages);

  if (showFreeLimitModal) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-bg">
        <FreeLimitModal onDismiss={() => setShowFreeLimitModal(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-bg">
      {/* ── Anonymous top bar ────────────��─────────────────────────── */}
      {mode === "anonymous" && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            {hasMessages ? (
              <button
                onClick={reset}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border text-text-1 transition-colors hover:bg-bg"
                aria-label="Start new check"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5m7-7-7 7 7 7" />
                </svg>
              </button>
            ) : (
              <Link
                href="/"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border text-text-2 transition-colors hover:bg-bg hover:text-text-1"
                aria-label="Back to home"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5m7-7-7 7 7 7" />
                </svg>
              </Link>
            )}
            <span className="text-[15px] font-semibold tracking-tight text-text-1">
              {hasMessages ? "Symptom check" : "MediTriage"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {!hasMessages && (
              <Link
                href="/login"
                className="rounded-full border border-border bg-bg px-3.5 py-1.5 text-[12px] font-medium text-text-2 transition-all hover:border-primary/40 hover:text-primary"
              >
                Sign in
              </Link>
            )}
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      )}

      {/* ── Member picker (authed + has members) ───────────────────── */}
      {mode === "authed" && familyMembers.length > 0 && !hasMessages && (
        <div className="border-b border-border bg-surface px-4 py-2.5">
          <div className="mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto">
            <span className="shrink-0 text-[12px] font-medium text-text-3">
              For:
            </span>
            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-all ${
                selectedMemberId === null
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-bg text-text-2 hover:border-primary/40 hover:text-primary"
              }`}
            >
              Me
            </button>
            {familyMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-all ${
                  selectedMemberId === m.id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg text-text-2 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {m.nickname}
              </button>
            ))}
            <Link
              href="/dashboard/family"
              className="shrink-0 rounded-full border border-dashed border-border px-3 py-1 text-[12px] text-text-3 transition-colors hover:border-primary/40 hover:text-primary"
            >
              + Add member
            </Link>
          </div>
        </div>
      )}

      {/* ── Progress bar (both modes when active) ────────────────── */}
      {hasMessages && (
        <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-2.5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="flex flex-1 flex-col gap-1">
              {selectedMember && (
                <span className="text-[11px] text-text-3">
                  Checking for{" "}
                  <strong className="font-semibold text-text-2">
                    {selectedMember.nickname}
                  </strong>
                </span>
              )}
              <span className="text-[12px] font-medium text-text-2">{roundLabel}</span>
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            {/* Lang toggle in authed mode lives here when chat is active */}
            {mode === "authed" && (
              <LangToggle lang={lang} setLang={setLang} compact />
            )}
          </div>
        </div>
      )}

      {/* ── Message area ─────────────────��─────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages && !isPending ? (
          <div className="flex min-h-full items-center justify-center px-6 py-10">
            <HeroEmptyState onPick={send} mode={mode} lang={lang} setLang={setLang} />
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-5 md:px-6">
            {messages.map((m, i) => (
              <MessageBubble key={`${m.role}-${i}`} message={m} />
            ))}

            {isPending && <ThinkingIndicator />}

            {response?.action === "ask_followup" && (
              <FollowupQuestions
                questions={response.followup_questions}
                onAnswer={send}
              />
            )}

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-xl border border-emergency/30 bg-emergency-bg px-4 py-3.5 text-sm"
              >
                <div className="flex items-start gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0 text-emergency"
                    aria-hidden="true"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-emergency">Something went wrong</p>
                    <p className="mt-0.5 text-[13px] text-emergency/80">{error}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      {lastInput && (
                        <button
                          onClick={retry}
                          className="flex items-center gap-1.5 rounded-lg bg-emergency px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-emergency/80"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                          </svg>
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => setError(null)}
                        className="text-[13px] text-emergency/70 underline underline-offset-2 hover:text-emergency"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input area ─────────────────────────────────────────────── */}
      <div className="border-t border-border bg-surface/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-md transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(45,95,79,.10),0_8px_24px_rgba(26,36,33,.07)]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="e.g. I've had a high fever since yesterday, body aches and very tired…"
              rows={3}
              aria-label="Describe your symptoms"
              className="w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-[1.65] text-text-1 placeholder:text-text-3 focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="hidden font-sans text-[12px] text-text-3 sm:block">
                  Hindi / தமி / తె also accepted
                </span>
                {/* Lang toggle in authed mode empty state */}
                {mode === "authed" && !hasMessages && (
                  <LangToggle lang={lang} setLang={setLang} compact />
                )}
              </div>
              <div className="flex items-center gap-2">
                <VoiceInputButton
                  onTranscript={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))}
                  lang={lang}
                />
                <button
                  onClick={() => send(input)}
                  disabled={isPending || !input.trim()}
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-text-3">
            AI guidance only — not a substitute for professional medical advice.{" "}
            <span className="text-emergency font-medium">Emergency? Call 108.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Hero empty state ──────────��─────────────────────────────────────
type HeroProps = Readonly<{
  onPick: (text: string) => void;
  mode: "anonymous" | "authed";
  lang: string;
  setLang: (l: string) => void;
}>;

function HeroEmptyState({ onPick, mode, lang, setLang }: HeroProps) {
  return (
    <div className="w-full max-w-lg animate-slide-up">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-inset ring-primary/12">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>

        <h2 className="font-serif text-[30px] leading-tight text-text-1 mb-2">
          {mode === "authed" ? "Start a new check" : "What's bothering you?"}
        </h2>
        <p className="text-[15px] text-text-2 leading-relaxed max-w-xs">
          Describe in your own words — no medical terms needed.
        </p>

        {/* Privacy badge */}
        <div className="mt-5 flex w-full max-w-sm items-center gap-2 rounded-xl border border-selfcare/20 bg-selfcare-bg px-4 py-2.5 text-[13px] text-text-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-selfcare"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Your symptoms are never stored without consent.
        </div>

        {/* Language toggle for anonymous mode (shown in empty state only) */}
        {mode === "anonymous" && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-text-3">
            <span>Language:</span>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        )}

        {/* Quick-pick chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SYMPTOM_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onPick(chip)}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-text-2 transition-all hover:border-primary/40 hover:bg-bg-tint hover:text-primary"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Subtle auth CTA for anonymous users */}
        {mode === "anonymous" && (
          <p className="mt-8 text-[13px] text-text-3">
            Want to save your results?{" "}
            <Link
              href="/signup"
              className="text-primary underline-offset-2 hover:underline"
            >
              Create a free account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

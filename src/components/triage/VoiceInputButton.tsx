"use client";

import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";

type VoiceInputButtonProps = Readonly<{
  onTranscript: (text: string) => void;
  lang?: string;
}>;

export function VoiceInputButton({ onTranscript, lang }: VoiceInputButtonProps) {
  const { listening, supported, start, stop } = useSpeechRecognition({
    lang,
    onResult: onTranscript,
  });

  if (!supported) return null;

  return (
    <div className="relative inline-flex items-center justify-center">
      {listening && (
        <>
          <span
            className="absolute h-[62px] w-[62px] rounded-full border-[1.5px] border-primary animate-pulse-expand"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="absolute h-[78px] w-[78px] rounded-full border-[1.5px] border-primary animate-pulse-expand"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}
      <button
        onClick={listening ? stop : start}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all hover:bg-primary-dark hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={listening ? "Stop recording" : "Speak symptoms"}
        aria-pressed={listening}
      >
        {listening ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>
    </div>
  );
}

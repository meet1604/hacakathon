"use client";
import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";

type Options = {
  lang?: string;
  onResult?: (text: string) => void;
};

function hasSpeechRecognition(): boolean {
  if (globalThis.window === undefined) return false;
  const g = globalThis as unknown as Record<string, unknown>;
  return Boolean(g.SpeechRecognition || g.webkitSpeechRecognition);
}

export function useSpeechRecognition({ lang = "en-IN", onResult }: Options = {}) {
  const [listening, setListening] = useState(false);
  const supported = useSyncExternalStore(
    () => () => {},
    hasSpeechRecognition,
    () => false
  );
  const recognitionRef = useRef<unknown>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const g = globalThis as unknown as Record<string, unknown>;
    const SR = g.SpeechRecognition || g.webkitSpeechRecognition;
    if (!SR) return;

    type SpeechRec = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: ((e: unknown) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    const rec = new (SR as new () => SpeechRec)();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const event = e as { results: { [key: number]: { transcript: string }[] } };
      const text = event.results[0][0].transcript;
      onResultRef.current?.(text);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;

    return () => {
      rec.stop();
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current as { start: () => void } | null;
    if (!rec || listening) return;
    setListening(true);
    rec.start();
  }, [listening]);

  const stop = useCallback(() => {
    const rec = recognitionRef.current as { stop: () => void } | null;
    rec?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

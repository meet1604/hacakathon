"use client";

import { useState, useEffect } from "react";

const STAGES = [
  "Listening to your symptoms…",
  "Running clinical analysis…",
  "Checking red-flag patterns…",
  "Generating care guidance…",
];

const STAGE_DURATION = 1800;

export function ThinkingIndicator() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, STAGE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex justify-start animate-slide-up"
      role="status"
      aria-live="polite"
      aria-label="AI is analyzing your symptoms"
    >
      <div className="flex items-center gap-3 rounded-xl rounded-bl-[4px] border border-border bg-surface px-4 py-3.5 shadow-sm">
        {/* Animated dots */}
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="block h-1.5 w-1.5 rounded-full bg-text-3 animate-dot-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>

        {/* Stage message */}
        <span
          key={stage}
          className="text-[13px] text-text-2 animate-slide-up"
          aria-live="polite"
        >
          {STAGES[stage]}
        </span>
      </div>
    </div>
  );
}

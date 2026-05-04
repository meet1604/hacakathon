"use client";

import type { FollowupQuestion } from "@/lib/triage/schema";

type FollowupQuestionsProps = Readonly<{
  questions: FollowupQuestion[];
  onAnswer: (text: string) => void;
}>;

export function FollowupQuestions({ questions, onAnswer }: FollowupQuestionsProps) {
  return (
    <div className="flex flex-col gap-3 animate-slide-up">
      {questions.map((q) => (
        <div
          key={q.q}
          className="rounded-xl rounded-bl-[4px] border border-border bg-surface p-4 shadow-sm"
        >
          <p className="mb-3 text-[15px] font-medium text-text-1">{q.q}</p>
          {q.options && q.options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onAnswer(`${q.q}: ${opt}`)}
                  className="rounded-full border border-border bg-bg px-3.5 py-1.5 text-[13px] text-text-2 transition-all hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

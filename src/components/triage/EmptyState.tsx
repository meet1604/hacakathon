"use client";

const EXAMPLE_PROMPTS = [
  "I have a fever for 3 days",
  "Chest pain and sweating",
  "Headache that won't go away",
  "My child has a rash",
];

export function EmptyState({ onPick }: Readonly<{ onPick: (text: string) => void }>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl">🩺</span>
      <h2 className="mt-4 text-xl font-semibold">Describe your symptoms</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Type below or tap one of these examples to get started.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPick(prompt)}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm transition-colors hover:bg-muted"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

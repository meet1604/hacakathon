import { TriageChat } from "@/components/triage/TriageChat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Symptom Check — MediTriage",
};

export default function TryPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <TriageChat mode="anonymous" />
    </main>
  );
}

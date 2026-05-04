import { TriageChat } from "@/components/triage/TriageChat";
import { DisclaimerFooter } from "@/components/shared/DisclaimerFooter";

export const metadata = {
  title: "Symptom Check — AI Symptom Pre-Screener",
};

export default function TriagePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <TriageChat />
      <DisclaimerFooter />
    </main>
  );
}

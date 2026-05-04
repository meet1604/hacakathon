import { Separator } from "@/components/ui/separator";

export function DisclaimerFooter() {
  return (
    <footer className="bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
      <Separator className="mb-3" />
      <p>
        <strong>Medical disclaimer:</strong> This tool provides informational
        guidance only and is not a substitute for professional medical advice,
        diagnosis, or treatment. Always call emergency services for
        life-threatening situations.
      </p>
    </footer>
  );
}

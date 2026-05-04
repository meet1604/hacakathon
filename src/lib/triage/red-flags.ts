export const RED_FLAG_KEYWORDS = [
  "chest pain",
  "chest tightness",
  "cannot breathe",
  "can't breathe",
  "difficulty breathing",
  "blue lips",
  "one-sided weakness",
  "face drooping",
  "facial droop",
  "slurred speech",
  "worst headache",
  "uncontrolled bleeding",
  "loss of consciousness",
  "passed out",
  "seizure",
  "anaphylaxis",
  "throat swelling",
  "suicidal",
  "want to die",
  "rigid abdomen",
  "sweating and chest",
] as const;

export function looksLikeEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_FLAG_KEYWORDS.some((kw) => lower.includes(kw));
}

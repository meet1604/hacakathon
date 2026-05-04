export function extractJSON(text: string): unknown {
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${(err as Error).message}`);
  }
}

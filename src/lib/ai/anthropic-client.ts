import Anthropic from "@anthropic-ai/sdk";
import {
  TriageResponseSchema,
  type TriageResponse,
  type Message,
  type MemberContext,
} from "@/lib/triage/schema";
import { TRIAGE_SYSTEM_PROMPT } from "./prompts/triage-system";
import { extractJSON } from "./extract-json";
import { logger } from "@/lib/utils/logger";

const MAX_TOKENS = 1024;
const TIMEOUT_MS = 45_000;
const MAX_RETRIES = 1;

// ─── Provider config ────────────────────────────────────────────────────────
// Set AI_PROVIDER=openrouter in .env.local for free dev usage (Qwen).
// Set AI_PROVIDER=anthropic  in production for Claude.
// Set AI_PROVIDER=nvidia     for NVIDIA NIM API.
const AI_PROVIDER = process.env.AI_PROVIDER ?? "gemini";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "qwen/qwen3-6b-instruct:free";
const OPENROUTER_BASE = process.env.OPENROUTER_BASE ?? "https://openrouter.ai/api/v1/chat/completions";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-405b-instruct";
const NVIDIA_BASE = process.env.NVIDIA_BASE ?? "https://integrate.api.nvidia.com/v1/chat/completions";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const GEMINI_BASE = process.env.GEMINI_BASE ?? "https://generativelanguage.googleapis.com/v1beta";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const GROQ_BASE = process.env.GROQ_BASE ?? "https://api.groq.com/openai/v1/chat/completions";

// ─── Anthropic singleton ─────────────────────────────────────────────────────
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
    _anthropic = new Anthropic({ apiKey, timeout: TIMEOUT_MS });
  }
  return _anthropic;
}

// ─── Raw text from each provider ────────────────────────────────────────────
async function callAnthropic(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
}

async function callOpenRouter(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const res = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const status = res.status;
    const body = await res.text().catch(() => "");
    logger.error("OpenRouter response error", { status, body });
    if (status === 429) {
      const err = new Error("rate_limited");
      (err as NodeJS.ErrnoException).code = "RATE_LIMITED";
      throw err;
    }
    throw new Error(`OpenRouter error: ${status}${body ? ` ${body}` : ""}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await res.text().catch(() => "");
    logger.error("OpenRouter unexpected non-JSON response", {
      status: res.status,
      contentType,
      body,
    });
    throw new Error(`OpenRouter error: ${res.status} non-JSON response`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function callGemini(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
          temperature: 0.1,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (!res.ok) {
    const status = res.status;
    const body = await res.text().catch(() => "");
    logger.error("Gemini response error", { status, body });
    if (status === 429) {
      const err = new Error("rate_limited");
      (err as NodeJS.ErrnoException).code = "RATE_LIMITED";
      throw err;
    }
    throw new Error(`Gemini error: ${status}${body ? ` ${body}` : ""}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callGroq(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing");

  const res = await fetch(GROQ_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const status = res.status;
    const body = await res.text().catch(() => "");
    logger.error("Groq response error", { status, body });
    if (status === 429) {
      const err = new Error("rate_limited");
      (err as NodeJS.ErrnoException).code = "RATE_LIMITED";
      throw err;
    }
    throw new Error(`Groq error: ${status}${body ? ` ${body}` : ""}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function callNvidia(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY missing");

  const res = await fetch(NVIDIA_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 429) {
      const err = new Error("rate_limited");
      (err as NodeJS.ErrnoException).code = "RATE_LIMITED";
      throw err;
    }
    throw new Error(`NVIDIA error: ${status}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

// ─── Public API (unchanged interface — API route needs no edits) ─────────────
export type AnalyzeResult =
  | { ok: true; data: TriageResponse }
  | { ok: false; error: { code: string; message: string } };

export async function analyzeSymptoms(
  messages: Message[],
  language: string = "English",
  memberContext?: MemberContext,
): Promise<AnalyzeResult> {
  let systemPrompt = TRIAGE_SYSTEM_PROMPT.replace("{{LANGUAGE}}", language);

  if (memberContext) {
    const ageBandNote = memberContext.ageBand
      ? `Age group: ${memberContext.ageBand}.`
      : "";
    const conditionsNote = memberContext.knownConditions
      ? `Known conditions: ${memberContext.knownConditions}.`
      : "";
    const contextBlock = [
      `PATIENT CONTEXT: This check is for ${memberContext.nickname}.`,
      ageBandNote,
      conditionsNote,
      "Adjust recommendations accordingly — for children (under 12), never suggest OTC medications; for elderly (60+), apply higher urgency thresholds.",
    ]
      .filter(Boolean)
      .join(" ");
    systemPrompt = `${contextBlock}\n\n${systemPrompt}`;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text =
        AI_PROVIDER === "openrouter"
          ? await callOpenRouter(messages, systemPrompt)
          : AI_PROVIDER === "nvidia"
          ? await callNvidia(messages, systemPrompt)
          : AI_PROVIDER === "gemini"
          ? await callGemini(messages, systemPrompt)
          : AI_PROVIDER === "groq"
          ? await callGroq(messages, systemPrompt)
          : await callAnthropic(messages, systemPrompt);

      const json = extractJSON(text);
      const parsed = TriageResponseSchema.safeParse(json);

      if (!parsed.success) {
        logger.warn("AI returned invalid schema", {
          provider: AI_PROVIDER,
          issues: JSON.stringify(parsed.error.issues),
        });
        if (attempt < MAX_RETRIES) continue;
        return {
          ok: false,
          error: {
            code: "INVALID_AI_RESPONSE",
            message: "Could not parse triage decision",
          },
        };
      }

      return { ok: true, data: parsed.data };
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      logger.error("AI provider error", {
        provider: AI_PROVIDER,
        msg: (err as Error).message,
      });

      if (code === "RATE_LIMITED" || (err instanceof Anthropic.APIError && err.status === 429)) {
        return {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "Service is busy. Please try again in a moment.",
          },
        };
      }
      if (err instanceof Anthropic.APIError && err.status === 401) {
        return {
          ok: false,
          error: { code: "AUTH_ERROR", message: "Service unavailable" },
        };
      }
      if (attempt >= MAX_RETRIES) {
        return {
          ok: false,
          error: {
            code: "AI_ERROR",
            message: "Could not analyze symptoms right now.",
          },
        };
      }
    }
  }

  return { ok: false, error: { code: "UNKNOWN", message: "Unknown error" } };
}

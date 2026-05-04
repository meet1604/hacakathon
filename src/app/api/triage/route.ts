import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { analyzeSymptoms } from "@/lib/ai/anthropic-client";
import { TriageInputSchema } from "@/lib/triage/schema";
import { rateLimit } from "@/lib/utils/rate-limit";
import { saveSession } from "@/lib/db/queries";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getOrCreateAnonId } from "@/lib/auth/anon-id";
import { logger } from "@/lib/utils/logger";
import type { TriageResponse } from "@/lib/triage/schema";

export const runtime = "nodejs";
export const maxDuration = 30;

function assistantMessageFromResponse(response: TriageResponse): string {
  if (response.action === "ask_followup") return response.reasoning;
  return response.doctor_summary || response.reasoning;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const limited = await rateLimit(ip, "triage", {
      max: 20,
      windowMs: 3_600_000,
    });
    if (limited) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        { status: 429 }
      );
    }

    const body: unknown = await req.json();
    const parsed = TriageInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INVALID_INPUT", message: "Invalid request body" },
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const anonymousId = await getOrCreateAnonId();

    const result = await analyzeSymptoms(
      parsed.data.messages,
      parsed.data.language,
      parsed.data.memberContext,
    );

    if (!result.ok) {
      return NextResponse.json(result, { status: 502 });
    }

    const finalMessages = [
      ...parsed.data.messages,
      { role: "assistant" as const, content: assistantMessageFromResponse(result.data) },
    ];

    const savedId = await saveSession({
      sessionId: parsed.data.sessionId,
      messages: finalMessages,
      response: result.data,
      language: parsed.data.language,
      anonymousId,
      userId: user?.id,
      patientName: parsed.data.memberContext?.nickname ?? null,
    }).catch((err) => {
      logger.error("Failed to save session", { err: String(err) });
      return null;
    });

    return NextResponse.json({
      ok: true,
      data: { ...result.data, sessionId: savedId ?? parsed.data.sessionId ?? null },
    });
  } catch (err) {
    logger.error("Triage route error", { err: String(err) });
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

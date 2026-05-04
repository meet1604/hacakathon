import { getServiceRoleClient, createSupabaseServer } from "./supabase-server";
import { logger } from "@/lib/utils/logger";
import type { Message, TriageResponse } from "@/lib/triage/schema";

type SaveSessionArgs = {
  sessionId?: string;
  messages: Message[];
  response: TriageResponse;
  language: string;
  anonymousId: string;
  userId?: string;
  patientName?: string | null;
};

export type SessionRow = {
  id: string;
  user_id?: string | null;
  anonymous_id?: string | null;
  created_at: string;
  updated_at?: string;
  title?: string | null;
  symptoms_summary?: string | null;
  patient_name?: string | null;
  status?: "in_progress" | "completed" | "abandoned" | null;
  last_message_at?: string | null;
  message_count?: number | null;
  final_severity: string | null;
  conversation: unknown;
  language: string;
  doctor_summary: string | null;
  red_flags?: unknown;
};

export type FamilyMemberRow = {
  id: string;
  user_id: string;
  nickname: string;
  relation: string | null;
  age_band: string | null;
  known_conditions: string | null;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  preferred_language: string | null;
  timezone: string | null;
  notification_email: boolean | null;
  anonymized_data: boolean | null;
  sms_alerts: boolean | null;
  chronic_conditions: string | null;
  known_allergies: string | null;
  current_medications: string | null;
};

export type ReportRow = {
  id: string;
  user_id: string;
  session_id: string;
  title: string;
  notes: string | null;
  created_at: string;
  triage_sessions?: SessionRow | null;
};

export type SessionStats = {
  total: number;
  thisMonth: number;
  dominantSeverity: string | null;
};

type DbError = {
  code?: string;
  message?: string;
};

function isSchemaError(error: DbError | null | undefined): boolean {
  const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    text.includes("pgrst204") ||
    text.includes("42p01") ||
    text.includes("42703") ||
    text.includes("schema cache") ||
    text.includes("could not find") ||
    text.includes("does not exist")
  );
}

function getFirstUserMessage(messages: Message[]): string {
  return messages.find((message) => message.role === "user")?.content ?? "Symptom check";
}

function getSessionTitle(messages: Message[]): string {
  return getFirstUserMessage(messages).slice(0, 64);
}

function getSessionSummary(messages: Message[]): string {
  return getFirstUserMessage(messages).slice(0, 180);
}

export async function saveSession(args: SaveSessionArgs): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getServiceRoleClient() as any;
    const finalSeverity =
      args.response.action === "triage" ? args.response.severity : null;
    const redFlags =
      args.response.action === "triage" ? args.response.red_flags : [];
    const doctorSummary =
      args.response.action === "triage" ? args.response.doctor_summary : null;
    const status = args.response.action === "triage" ? "completed" : "in_progress";
    const lastMessageAt = new Date().toISOString();

    const basePayload = {
      conversation: args.messages,
      final_severity: finalSeverity,
      red_flags: redFlags,
      doctor_summary: doctorSummary,
      language: args.language,
      ...(args.userId ? { user_id: args.userId } : {}),
    };

    const payload = {
      ...basePayload,
      title: getSessionTitle(args.messages),
      symptoms_summary: getSessionSummary(args.messages),
      patient_name: args.patientName ?? null,
      status,
      last_message_at: lastMessageAt,
      message_count: args.messages.length,
    };

    if (args.sessionId) {
      const updateSession = (data: typeof payload | typeof basePayload) => {
        let query = client.from("triage_sessions").update(data).eq("id", args.sessionId);
        query = args.userId
          ? query.eq("user_id", args.userId)
          : query.eq("anonymous_id", args.anonymousId);
        return query;
      };

      const { error } = await updateSession(payload);
      if (error) {
        if (isSchemaError(error)) {
          const { error: retryError } = await updateSession(basePayload);
          if (retryError) logger.warn("DB update session failed", { err: retryError.message });
        } else {
          logger.warn("DB update session failed", { err: error.message });
        }
      }
      return args.sessionId;
    }

    const insertSession = (data: typeof payload | typeof basePayload) =>
      client
        .from("triage_sessions")
        .insert({
          anonymous_id: args.anonymousId,
          ...data,
        })
        .select("id")
        .single();

    let { data, error } = await insertSession(payload);

    if (error) {
      if (isSchemaError(error)) {
        const retry = await insertSession(basePayload);
        data = retry.data;
        error = retry.error;
      }
      if (error) logger.warn("DB insert session failed", { err: error.message });
    }
    return (data as { id: string } | null)?.id ?? null;
  } catch (err) {
    logger.error("DB save session threw", { err: String(err) });
    return null;
  }
}

export async function getSessionById(
  userId: string,
  sessionId: string
): Promise<SessionRow | null> {
  try {
    const supabase = await createSupabaseServer();
    const readSession = (withDeletedFilter: boolean) => {
      let query = supabase
        .from("triage_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", userId);
      if (withDeletedFilter) query = query.is("deleted_at", null);
      return query.single();
    };

    let { data, error } = await readSession(true);
    if (error && isSchemaError(error)) {
      const retry = await readSession(false);
      data = retry.data;
      error = retry.error;
    }
    if (error) return null;
    return data as SessionRow;
  } catch {
    return null;
  }
}

export async function getRecentSessions(
  userId: string | null,
  limit = 3
): Promise<SessionRow[]> {
  if (!userId) return [];
  try {
    const supabase = await createSupabaseServer();
    const readSessions = (withDeletedFilter: boolean) => {
      let query = supabase
        .from("triage_sessions")
        .select("*")
        .eq("user_id", userId)
        .not("final_severity", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (withDeletedFilter) query = query.is("deleted_at", null);
      return query;
    };

    let { data, error } = await readSessions(true);
    if (error && isSchemaError(error)) {
      const retry = await readSessions(false);
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      logger.warn("getRecentSessions failed", { err: error.message });
      return [];
    }
    return (data as SessionRow[]) ?? [];
  } catch (err) {
    logger.warn("getRecentSessions threw", { err: String(err) });
    return [];
  }
}

export async function getAllSessions(
  userId: string | null,
  filters: { severity?: string; from?: string; to?: string; q?: string } = {}
): Promise<SessionRow[]> {
  if (!userId) return [];
  try {
    const supabase = await createSupabaseServer();
    const readSessions = (withDeletedFilter: boolean, withSummarySearch: boolean) => {
      let query = supabase
        .from("triage_sessions")
        .select("*")
        .eq("user_id", userId)
        .not("final_severity", "is", null)
        .order("created_at", { ascending: false });

      if (withDeletedFilter) query = query.is("deleted_at", null);
      if (filters.severity && filters.severity !== "all") {
        if (filters.severity === "clinic") {
          query = query.in("final_severity", ["clinic_today", "clinic_soon"]);
        } else {
          query = query.eq("final_severity", filters.severity);
        }
      }
      if (filters.from) query = query.gte("created_at", filters.from);
      if (filters.to) query = query.lte("created_at", filters.to);
      if (withSummarySearch && filters.q) query = query.ilike("symptoms_summary", `%${filters.q}%`);
      return query;
    };

    let { data, error } = await readSessions(true, true);
    if (error && isSchemaError(error)) {
      const retry = await readSessions(false, false);
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      logger.warn("getAllSessions failed", { err: error.message });
      return [];
    }
    let sessions = (data as SessionRow[]) ?? [];
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      sessions = sessions.filter((session) => {
        const summary = session.symptoms_summary ?? "";
        const conversation = Array.isArray(session.conversation)
          ? session.conversation
              .map((msg) => String((msg as { content?: string }).content ?? ""))
              .join(" ")
          : "";
        return `${summary} ${conversation}`.toLowerCase().includes(needle);
      });
    }
    return sessions;
  } catch (err) {
    logger.warn("getAllSessions threw", { err: String(err) });
    return [];
  }
}

export async function softDeleteSession(userId: string, sessionId: string) {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("triage_sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);
  if (error && isSchemaError(error)) {
    const { error: deleteError } = await supabase
      .from("triage_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);
    if (deleteError) throw new Error(`deleteSession: ${deleteError.message}`);
    return;
  }
  if (error) throw new Error(`softDeleteSession: ${error.message}`);
}

export async function getFamilyMembers(
  userId: string
): Promise<FamilyMemberRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      logger.warn("getFamilyMembers failed", { err: error.message });
      return [];
    }
    return (data as FamilyMemberRow[]) ?? [];
  } catch (err) {
    logger.warn("getFamilyMembers threw", { err: String(err) });
    return [];
  }
}

export async function listReports(userId: string): Promise<ReportRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("reports")
      .select("*, triage_sessions(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.warn("listReports failed", { err: error.message });
      return [];
    }
    return (data as ReportRow[]) ?? [];
  } catch (err) {
    logger.warn("listReports threw", { err: String(err) });
    return [];
  }
}

export async function saveReport(userId: string, sessionId: string, title: string) {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("reports")
    .upsert({ user_id: userId, session_id: sessionId, title }, { onConflict: "user_id,session_id" })
    .select()
    .single();
  if (error) throw new Error(`saveReport: ${error.message}`);
  return data as ReportRow;
}

export async function deleteReport(userId: string, reportId: string) {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", userId);
  if (error) throw new Error(`deleteReport: ${error.message}`);
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) {
      logger.warn("getProfile failed", { err: error.message });
      return null;
    }
    return data as ProfileRow | null;
  } catch (err) {
    logger.warn("getProfile threw", { err: String(err) });
    return null;
  }
}

export async function updateProfile(userId: string, patch: Partial<ProfileRow>) {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(`updateProfile: ${error.message}`);
  return data as ProfileRow;
}

export async function getSessionStats(userId: string): Promise<SessionStats> {
  const sessions = await getAllSessions(userId);
  if (sessions.length === 0) {
    return { total: 0, thisMonth: 0, dominantSeverity: null };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = sessions.filter((s) => s.created_at >= monthStart).length;

  const counts = sessions.reduce<Record<string, number>>((acc, s) => {
    const key = s.final_severity ?? "self_care";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const dominantSeverity =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { total: sessions.length, thisMonth, dominantSeverity };
}

export async function deleteAllUserData(userId: string) {
  const supabase = await createSupabaseServer();
  const deletedAt = new Date().toISOString();
  const [{ error: sessionsError }, { error: reportsError }, { error: familyError }] =
    await Promise.all([
      supabase
        .from("triage_sessions")
        .update({ deleted_at: deletedAt })
        .eq("user_id", userId),
      supabase.from("reports").delete().eq("user_id", userId),
      supabase.from("family_members").delete().eq("user_id", userId),
    ]);

  let sessionFallbackError = null;
  if (sessionsError && isSchemaError(sessionsError)) {
    const { error } = await supabase.from("triage_sessions").delete().eq("user_id", userId);
    sessionFallbackError = error;
  }

  const error = sessionFallbackError ?? (isSchemaError(sessionsError) ? null : sessionsError) ?? reportsError ?? familyError;
  if (error) throw new Error(`deleteAllUserData: ${error.message}`);
}

export async function claimAnonymousSessions(userId: string, anonymousId: string) {
  if (!anonymousId) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getServiceRoleClient() as any;
    const { error } = await client
      .from("triage_sessions")
      .update({ user_id: userId })
      .eq("anonymous_id", anonymousId)
      .is("user_id", null);
    if (error) logger.warn("claimAnonymousSessions failed", { err: error.message });
  } catch (err) {
    logger.warn("claimAnonymousSessions threw", { err: String(err) });
  }
}

export async function logActivity(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {}
) {
  if (!userId) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getServiceRoleClient() as any;
    await client.from("activity_log").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch {
    // Logging must never break the request.
  }
}

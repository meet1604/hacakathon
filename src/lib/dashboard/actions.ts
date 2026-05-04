"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import {
  deleteAllUserData,
  deleteReport,
  getSessionById,
  logActivity,
  saveReport,
  softDeleteSession,
  updateProfile,
} from "@/lib/db/queries";

type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

const IdSchema = z.string().uuid();

const ProfileSchema = z.object({
  full_name: z.string().max(80).optional().nullable(),
  preferred_language: z.string().max(20).default("en-IN"),
  timezone: z.string().max(80).default("Asia/Kolkata"),
  notification_email: z.boolean().default(false),
  anonymized_data: z.boolean().default(false),
  sms_alerts: z.boolean().default(false),
  chronic_conditions: z.string().max(500).optional().nullable(),
  known_allergies: z.string().max(500).optional().nullable(),
  current_medications: z.string().max(1000).optional().nullable(),
});

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

export async function saveReportAction(sessionId: string): Promise<ActionResult> {
  try {
    const parsed = IdSchema.safeParse(sessionId);
    if (!parsed.success) return { ok: false, error: "Invalid session" };

    const user = await requireUser();
    const session = await getSessionById(user.id, parsed.data);
    if (!session) return { ok: false, error: "Session not found" };

    const title =
      session.title ??
      session.symptoms_summary?.slice(0, 64) ??
      "Doctor-ready triage report";

    await saveReport(user.id, parsed.data, title);
    await logActivity(user.id, "report.save", "session", parsed.data);
    revalidatePath("/dashboard/pdfs");
    revalidatePath(`/dashboard/check/${parsed.data}`);
    return { ok: true, message: "Report saved" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not save report" };
  }
}

export async function deleteReportAction(reportId: string): Promise<ActionResult> {
  try {
    const parsed = IdSchema.safeParse(reportId);
    if (!parsed.success) return { ok: false, error: "Invalid report" };
    const user = await requireUser();
    await deleteReport(user.id, parsed.data);
    await logActivity(user.id, "report.delete", "report", parsed.data);
    revalidatePath("/dashboard/pdfs");
    return { ok: true, message: "Report deleted" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not delete report" };
  }
}

export async function deleteSessionAction(sessionId: string): Promise<ActionResult> {
  try {
    const parsed = IdSchema.safeParse(sessionId);
    if (!parsed.success) return { ok: false, error: "Invalid session" };
    const user = await requireUser();
    await softDeleteSession(user.id, parsed.data);
    await logActivity(user.id, "session.delete", "session", parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/pdfs");
    revalidatePath("/dashboard/insights");
    return { ok: true, message: "Check removed" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not delete check" };
  }
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = ProfileSchema.safeParse({
      full_name: nullableString(formData.get("full_name")),
      preferred_language: String(formData.get("preferred_language") ?? "en-IN"),
      timezone: String(formData.get("timezone") ?? "Asia/Kolkata"),
      notification_email: formData.get("notification_email") === "on",
      anonymized_data: formData.get("anonymized_data") === "on",
      sms_alerts: formData.get("sms_alerts") === "on",
      chronic_conditions: nullableString(formData.get("chronic_conditions")),
      known_allergies: nullableString(formData.get("known_allergies")),
      current_medications: nullableString(formData.get("current_medications")),
    });

    if (!parsed.success) return { ok: false, error: "Invalid settings" };
    const user = await requireUser();
    await updateProfile(user.id, parsed.data);
    await logActivity(user.id, "profile.update", "profile", user.id);
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { ok: true, message: "Settings saved" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not save settings" };
  }
}

export async function deleteAllUserDataAction(): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await deleteAllUserData(user.id);
    await logActivity(user.id, "account.data_delete", "profile", user.id);
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Your saved dashboard data was deleted" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not delete data" };
  }
}

export async function deleteAllUserDataAndSignOut() {
  const result = await deleteAllUserDataAction();
  if (result.ok) redirect("/");
  return result;
}

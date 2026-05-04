"use server";

import { createSupabaseServer, getServiceRoleClient } from "@/lib/db/supabase-server";
import { getOrCreateAnonId } from "@/lib/auth/anon-id";
import { claimAnonymousSessions } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { z } from "zod";

const CredsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signInWithPassword(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = CredsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid email or password format." };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await claimAnonymousSessions(user.id, await getOrCreateAnonId());

  const next = (formData.get("next") as string | null) || "/dashboard";
  redirect(next);
}

export async function signUpWithPassword(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = CredsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Email and 8+ character password required." };

  const confirm = formData.get("confirm") as string | null;
  if (confirm !== parsed.data.password) return { error: "Passwords do not match." };

  const admin = getServiceRoleClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (createError && !createError.message.toLowerCase().includes("already registered")) {
    return { error: createError.message };
  }

  const supabase = await createSupabaseServer();
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
  if (signInError) return { error: signInError.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await claimAnonymousSessions(user.id, await getOrCreateAnonId());

  const next = (formData.get("next") as string | null) || "/dashboard?welcome=1";
  redirect(next);
}

export async function signInWithGoogle(next: string = "/dashboard") {
  const supabase = await createSupabaseServer();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) return;
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

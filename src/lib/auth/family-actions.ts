"use server";

import { createSupabaseServer } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AGE_BANDS = ["child", "teen", "adult", "elderly"] as const;

const MemberSchema = z.object({
  nickname: z.string().min(1, "Name is required").max(50),
  relation: z.string().max(30).optional().nullable(),
  age_band: z.enum(AGE_BANDS).optional().nullable(),
  known_conditions: z.string().max(500).optional().nullable(),
});

export type FamilyActionState = { error: string | null };

export async function addFamilyMember(
  _prev: FamilyActionState,
  formData: FormData
): Promise<FamilyActionState> {
  const parsed = MemberSchema.safeParse({
    nickname: formData.get("nickname"),
    relation: formData.get("relation") || null,
    age_band: formData.get("age_band") || null,
    known_conditions: formData.get("known_conditions") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("family_members")
    .insert({ user_id: user.id, ...parsed.data });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/family");
  return { error: null };
}

export async function editFamilyMember(
  _prev: FamilyActionState,
  formData: FormData
): Promise<FamilyActionState> {
  const id = formData.get("id") as string | null;
  if (!id) return { error: "Missing member ID" };

  const parsed = MemberSchema.safeParse({
    nickname: formData.get("nickname"),
    relation: formData.get("relation") || null,
    age_band: formData.get("age_band") || null,
    known_conditions: formData.get("known_conditions") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("family_members")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/family");
  return { error: null };
}

export async function deleteFamilyMember(
  formData: FormData
): Promise<FamilyActionState> {
  const id = formData.get("id") as string | null;
  if (!id) return { error: "Missing member ID" };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("family_members")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/family");
  return { error: null };
}

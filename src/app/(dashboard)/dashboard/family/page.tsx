import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getFamilyMembers } from "@/lib/db/queries";
import { FamilyMemberManager } from "@/components/dashboard/FamilyMemberManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Family — MediTriage" };

export default async function FamilyPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const members = user ? await getFamilyMembers(user.id) : [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-[24px] text-text-1">Family members</h1>
        <p className="mt-1 text-[14px] text-text-2">
          Triage for family members — AI adjusts guidance per age group and known conditions.
        </p>
      </div>

      <FamilyMemberManager members={members} />

      {/* Info card */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
          How it works
        </p>
        <p className="text-[14px] leading-[1.65] text-text-2">
          When starting a new check, you can select a family member. The AI will adjust its questions and recommendations based on their age group and any known conditions — for example, avoiding OTC suggestions for children or applying higher urgency for elderly members.
        </p>
      </div>
    </div>
  );
}

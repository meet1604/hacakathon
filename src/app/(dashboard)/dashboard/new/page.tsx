import { TriageChat } from "@/components/triage/TriageChat";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getFamilyMembers } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Check — MediTriage" };

export default async function NewCheckPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const familyMembers = user ? await getFamilyMembers(user.id) : [];

  return (
    <div className="-m-4 flex h-[calc(100dvh-60px)] flex-col md:-m-6">
      <TriageChat mode="authed" familyMembers={familyMembers} />
    </div>
  );
}

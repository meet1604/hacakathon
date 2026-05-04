import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getOrCreateAnonId } from "@/lib/auth/anon-id";
import { claimAnonymousSessions } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await claimAnonymousSessions(user.id, await getOrCreateAnonId());
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

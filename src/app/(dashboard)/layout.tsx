import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-62 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <Sidebar email={user.email ?? ""} name={displayName} />
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-15 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary font-serif text-[13px] font-bold text-white">
              M
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.3px] text-text-1">
              MediTriage
            </span>
          </div>
          {/* Desktop breadcrumb */}
          <div className="hidden md:block">
            <DashboardHeader />
          </div>

          <div className="flex items-center gap-3">
            <UserMenu email={user.email ?? ""} name={displayName} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}

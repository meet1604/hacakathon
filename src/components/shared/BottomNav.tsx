"use client";

type NavItem = { id: string; label: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Check",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function BottomNav({ active = "home" }: Readonly<{ active?: string }>) {
  return (
    <nav
      className="flex border-t border-border bg-surface"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`flex flex-1 flex-col items-center gap-0.5 px-2 pt-2 pb-1.5 text-[11px] font-medium transition-colors ${
            active === item.id ? "text-primary" : "text-text-3"
          }`}
          aria-current={active === item.id ? "page" : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

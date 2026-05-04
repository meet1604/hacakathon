import Link from "next/link";

type TopBarProps = Readonly<{
  title?: string;
  back?: boolean;
  backHref?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  showLogo?: boolean;
}>;

export function TopBar({ title, back = false, backHref, onBack, action, showLogo = false }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3.5 sticky top-0 z-10">
      {back ? (
        onBack ? (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-transparent text-text-1 transition-colors hover:bg-bg flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
          </button>
        ) : (
          <Link
            href={backHref ?? "/"}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-transparent text-text-1 transition-colors hover:bg-bg flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
          </Link>
        )
      ) : showLogo ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-primary font-serif text-[15px] font-bold text-white">
            M
          </div>
        </div>
      ) : null}

      <span className="flex-1 text-base font-semibold text-text-1">{title}</span>

      {action && (
        <div className="flex items-center gap-2 text-text-2">{action}</div>
      )}
    </div>
  );
}

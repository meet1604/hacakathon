"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";

type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  toast: (opts: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <polyline points="20 6 9 17 4 12" />
  ),
  error: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  warning: (
    <>
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  info: (
    <>
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
};

const COLORS: Record<ToastType, { border: string; iconWrap: string }> = {
  success: { border: "border-l-selfcare", iconWrap: "bg-selfcare-bg text-selfcare" },
  error:   { border: "border-l-emergency", iconWrap: "bg-emergency-bg text-emergency" },
  warning: { border: "border-l-caution", iconWrap: "bg-caution-bg text-caution" },
  info:    { border: "border-l-primary/60", iconWrap: "bg-primary/8 text-primary" },
};

function SingleToast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const { border, iconWrap } = COLORS[item.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`pointer-events-auto flex w-full max-w-[380px] items-start gap-3 overflow-hidden rounded-xl border border-l-[3px] ${border} border-border bg-surface p-3.5 shadow-lg animate-slide-up`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${iconWrap}`}
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONS[item.type]}
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-text-1">{item.title}</p>
        {item.message && (
          <p className="mt-0.5 text-[13px] leading-[1.5] text-text-2">
            {item.message}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:bg-bg-tint hover:text-text-2"
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

const DURATION = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev.slice(-4), { ...opts, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, DURATION);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-5 z-[9999] flex flex-col items-end gap-2.5 sm:right-5"
        style={{ "--toast-w": "380px" } as CSSProperties}
      >
        {items.map((item) => (
          <SingleToast key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

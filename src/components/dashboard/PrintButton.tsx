"use client";

export function PrintButton({ sessionId }: { sessionId: string }) {
  const handleDownload = () => {
    window.open(`/api/pdf/${sessionId}`, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      className="flex h-9 items-center gap-2 rounded-[10px] border border-border px-3.5 text-[13px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF
    </button>
  );
}

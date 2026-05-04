"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-emergency-bg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emergency">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-1 mb-2">Something went wrong</h2>
        <p className="text-text-2 mb-6 max-w-md">
          We encountered an error loading your dashboard. This might be a temporary issue.
        </p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-4 py-2 border border-border rounded-xl hover:bg-bg-tint transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
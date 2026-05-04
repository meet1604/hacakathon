import Link from "next/link";

export default function CheckNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-bg-tint flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-3">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-1 mb-2">Check not found</h2>
        <p className="text-text-2 mb-6 max-w-md">
          This symptom check doesn't exist or you don't have permission to view it.
        </p>
      </div>
      
      <div className="flex gap-3">
        <Link
          href="/dashboard/history"
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          View history
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-border rounded-xl hover:bg-bg-tint transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
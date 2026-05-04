export default function HistoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32"></div>
      
      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
      </div>

      {/* History list skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
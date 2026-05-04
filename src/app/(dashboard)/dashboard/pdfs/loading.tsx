export default function ReportsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-80"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Reports grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
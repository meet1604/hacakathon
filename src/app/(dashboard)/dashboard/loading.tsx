export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome card skeleton */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Recent checks skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
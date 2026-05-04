export default function FamilyLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Add button skeleton */}
      <div className="h-11 bg-gray-200 rounded-xl"></div>

      {/* Family members skeleton */}
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex gap-1">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
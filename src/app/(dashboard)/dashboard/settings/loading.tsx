export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        {/* Profile card skeleton */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Settings form skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="h-11 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
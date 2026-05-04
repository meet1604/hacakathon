export default function CheckDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-3xl">
      {/* Severity result skeleton */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      {/* Conversation skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-4 ${i % 2 === 0 ? 'bg-primary/10' : 'bg-surface border border-border'}`}>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-3">
        <div className="h-9 bg-gray-200 rounded-xl w-32"></div>
        <div className="h-9 bg-gray-200 rounded-xl w-28"></div>
      </div>
    </div>
  );
}
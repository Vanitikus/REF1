export default function Loading() {
  return (
    <div className="py-6 space-y-6 animate-fade-in">
      {/* Hero skeleton */}
      <div className="h-48 rounded-2xl skeleton-shimmer" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 rounded-full skeleton-shimmer" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="h-44 skeleton-shimmer" />
            <div className="p-4 space-y-3 bg-white">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                <div className="h-5 w-20 rounded-full skeleton-shimmer" />
              </div>
              <div className="h-5 w-3/4 rounded skeleton-shimmer" />
              <div className="h-4 w-1/2 rounded skeleton-shimmer" />
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <div className="h-4 w-24 rounded skeleton-shimmer" />
                <div className="h-4 w-16 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

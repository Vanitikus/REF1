export default function ProfilLoading() {
  return (
    <div className="py-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full skeleton-shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-40 rounded skeleton-shimmer" />
          <div className="h-4 w-56 rounded skeleton-shimmer" />
          <div className="flex gap-4 mt-2">
            <div className="h-4 w-20 rounded skeleton-shimmer" />
            <div className="h-4 w-20 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export default function ChatLoading() {
  return (
    <div className="py-6 max-w-3xl mx-auto animate-fade-in">
      <div className="h-8 w-48 rounded skeleton-shimmer mb-4" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full skeleton-shimmer" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-full skeleton-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded skeleton-shimmer" />
              <div className="h-3 w-48 rounded skeleton-shimmer" />
            </div>
            <div className="h-5 w-5 rounded-full skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

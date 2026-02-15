export default function HartaLoading() {
  return (
    <div className="animate-fade-in">
      <div className="h-[calc(100vh-8rem)] rounded-2xl skeleton-shimmer relative">
        <div className="absolute top-4 left-4 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-white/80 skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

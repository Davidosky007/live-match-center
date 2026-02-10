export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-md p-4 shadow-card h-[88px] skeleton"
          role="status"
          aria-label="Loading match data"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-24 bg-surface-2 rounded skeleton" />
            <div className="h-3 w-12 bg-surface-2 rounded skeleton" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-surface-2 rounded-full skeleton" />
              <div className="h-4 w-16 bg-surface-2 rounded skeleton" />
            </div>
            <div className="h-6 w-12 bg-surface-2 rounded skeleton" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-surface-2 rounded skeleton" />
              <div className="w-8 h-8 bg-surface-2 rounded-full skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

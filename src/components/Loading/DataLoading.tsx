export default function DataLoading({
  itemCount = 3,
  className = "",
}: {
  itemCount?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3  ${className} grid grid-cols-3  gap-4`}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse shadow-sm border border-gray-200 rounded-2"
        >
          <div className="bg-background border border-border rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="space-y-2 flex-1">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

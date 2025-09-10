import { LuServerCrash, LuRefreshCw } from "react-icons/lu";

interface LoadingErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export default function LoadingError({
  error,
  onRetry,
  className = "",
}: LoadingErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <div className="text-center space-y-4">
        <div className="p-4 bg-red-50 rounded-2xl inline-block">
          <LuServerCrash className="text-3xl text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Failed to Load
          </h3>
          <p className="text-foreground/70 mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <LuRefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}

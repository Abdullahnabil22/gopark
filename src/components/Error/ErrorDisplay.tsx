import { FaBug } from "react-icons/fa6";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";
import {
  LuLoaderCircle,
  LuWifiOff,
  LuServerCrash,
  LuRefreshCw,
} from "react-icons/lu";
import type { ErrorType } from "./ErrorBoundary";
interface ErrorDisplayProps {
  error: Error | null;
  errorType: ErrorType;
  retryCount: number;
  onRetry: () => void;
  onGoHome: () => void;
}

export default function ErrorDisplay({
  error,
  errorType,
  retryCount,
  onRetry,
  onGoHome,
}: ErrorDisplayProps) {
  const getErrorConfig = (type: ErrorType) => {
    switch (type) {
      case "network":
        return {
          icon: <LuWifiOff className="text-4xl text-orange-500" />,
          title: "Connection Problem",
          message:
            "It looks like you're having trouble connecting to our servers. Please check your internet connection and try again.",
          action: "Retry Connection",
        };
      case "server":
        return {
          icon: <LuServerCrash className="text-4xl text-red-500" />,
          title: "Server Error",
          message:
            "Our servers are experiencing some issues. We're working to fix this as quickly as possible.",
          action: "Try Again",
        };
      case "notFound":
        return {
          icon: <LuLoaderCircle className="text-4xl text-blue-500" />,
          title: "Page Not Found",
          message:
            "The page you're looking for doesn't exist or has been moved.",
          action: "Go Home",
        };
      case "unauthorized":
        return {
          icon: <LuLoaderCircle className="text-4xl text-yellow-500" />,
          title: "Access Denied",
          message:
            "You don't have permission to access this resource. Please log in or contact support.",
          action: "Go Home",
        };
      case "forbidden":
        return {
          icon: <LuLoaderCircle className="text-4xl text-red-500" />,
          title: "Forbidden",
          message:
            "You don't have the necessary permissions to perform this action.",
          action: "Go Home",
        };
      case "timeout":
        return {
          icon: <LuLoaderCircle className="text-4xl text-orange-500" />,
          title: "Request Timeout",
          message: "The request took too long to complete. Please try again.",
          action: "Retry",
        };
      default:
        return {
          icon: <FaExclamationTriangle className="text-4xl text-red-500" />,
          title: "Something Went Wrong",
          message:
            "An unexpected error occurred. Our team has been notified and we're working to fix it.",
          action: "Try Again",
        };
    }
  };

  const config = getErrorConfig(errorType);
  const isRetryable = ["network", "server", "timeout", "general"].includes(
    errorType
  );
  const showGoHome = !["network", "server", "timeout"].includes(errorType);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-background border border-border rounded-2xl p-8 text-center shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-muted/50 rounded-2xl">{config.icon}</div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            {config.title}
          </h1>

          <p className="text-foreground/70 mb-6 leading-relaxed">
            {config.message}
          </p>

          {import.meta.env.DEV && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-foreground/70 mb-2">
                Error Details (Development)
              </summary>
              <div className="bg-muted p-3 rounded-lg text-xs font-mono text-foreground/60 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {retryCount > 0 && (
            <p className="text-sm text-foreground/50 mb-4">
              Retry attempt: {retryCount}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {isRetryable && (
              <button
                onClick={onRetry}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <LuRefreshCw className="w-4 h-4" />
                <span>{config.action}</span>
              </button>
            )}

            {showGoHome && (
              <button
                onClick={onGoHome}
                className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FaHome className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              const errorReport = {
                message: error?.message || "Unknown error",
                stack: error?.stack || "",
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
              };

              console.error("Error Report:", errorReport);
              alert(
                "Error report logged to console. In production, this would be sent to our error tracking service."
              );
            }}
            className="mt-4 text-sm text-foreground/50 hover:text-foreground/70 transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto"
          >
            <FaBug className="w-3 h-3" />
            <span>Report Bug</span>
          </button>
        </div>
      </div>
    </div>
  );
}

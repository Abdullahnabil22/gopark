import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import ErrorDisplay from "./ErrorDisplay";

export type ErrorType =
  | "general"
  | "network"
  | "server"
  | "notFound"
  | "unauthorized"
  | "forbidden"
  | "timeout"
  | "validation"
  | "unknown";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "general",
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    let errorType: ErrorType = "general";

    if (
      error.message.includes("Network Error") ||
      error.message.includes("fetch")
    ) {
      errorType = "network";
    } else if (
      error.message.includes("404") ||
      error.message.includes("Not Found")
    ) {
      errorType = "notFound";
    } else if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      errorType = "unauthorized";
    } else if (
      error.message.includes("403") ||
      error.message.includes("Forbidden")
    ) {
      errorType = "forbidden";
    } else if (
      error.message.includes("500") ||
      error.message.includes("Internal Server Error")
    ) {
      errorType = "server";
    } else if (
      error.message.includes("timeout") ||
      error.message.includes("Timeout")
    ) {
      errorType = "timeout";
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      } else {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "general",
      retryCount: 0,
    });
  };

  handleRetry = () => {
    const { retryCount } = this.state;
    this.setState({ retryCount: retryCount + 1 });

    
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    const { hasError, error, errorType, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
  
      if (fallback) {
        return fallback;
      }

    
      return (
        <ErrorDisplay
          error={error}
          errorType={errorType}
          retryCount={retryCount}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;

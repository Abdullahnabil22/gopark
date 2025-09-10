import {
  LuClock,
  LuLoaderCircle,
  LuServerCrash,
  LuShield,
  LuWifiOff,
} from "react-icons/lu";
import type { ErrorType } from "./ErrorBoundary";
import { FaExclamationTriangle } from "react-icons/fa";

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  action: string;
  color: string;
  bgColor: string;
}
export default function getErrorConfig(type: ErrorType): ErrorConfig {
  switch (type) {
    case "network":
      return {
        icon: <LuWifiOff className="text-4xl" />,
        title: "Connection Problem",
        message:
          "It looks like you're having trouble connecting to our servers. Please check your internet connection and try again.",
        action: "Retry Connection",
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      };
    case "server":
      return {
        icon: <LuServerCrash className="text-4xl" />,
        title: "Server Error",
        message:
          "Our servers are experiencing some issues. We're working to fix this as quickly as possible.",
        action: "Try Again",
        color: "text-red-500",
        bgColor: "bg-red-50",
      };
    case "notFound":
      return {
        icon: <LuLoaderCircle className="text-4xl" />,
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        action: "Go Home",
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      };
    case "unauthorized":
      return {
        icon: <LuShield className="text-4xl" />,
        title: "Access Denied",
        message:
          "You don't have permission to access this resource. Please log in or contact support.",
        action: "Go Home",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    case "forbidden":
      return {
        icon: <LuShield className="text-4xl" />,
        title: "Forbidden",
        message:
          "You don't have the necessary permissions to perform this action.",
        action: "Go Home",
        color: "text-red-500",
        bgColor: "bg-red-50",
      };
    case "timeout":
      return {
        icon: <LuClock className="text-4xl" />,
        title: "Request Timeout",
        message: "The request took too long to complete. Please try again.",
        action: "Retry",
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      };
    case "validation":
      return {
        icon: <LuLoaderCircle className="text-4xl" />,
        title: "Validation Error",
        message: "Please check your input and try again.",
        action: "Try Again",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    default:
      return {
        icon: <FaExclamationTriangle className="text-4xl" />,
        title: "Something Went Wrong",
        message:
          "An unexpected error occurred. Our team has been notified and we're working to fix it.",
        action: "Try Again",
        color: "text-red-500",
        bgColor: "bg-red-50",
      };
  }
}

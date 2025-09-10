import { type ReactNode } from "react";
import { Link } from "react-router";
import { FaArrowLeft } from "react-icons/fa6";
import { type IconType } from "react-icons";

interface BaseHeaderProps {
  
  icon: IconType;
  title: string;
  subtitle?: string;
  
 
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  
  
  rightContent?: ReactNode;
  
  
  additionalContent?: ReactNode;
  
  
  className?: string;
}

export default function BaseHeader({
  icon: Icon,
  title,
  subtitle,
  showBackButton = true,
  backTo = "/",
  backLabel = "Back to Home",
  rightContent,
  additionalContent,
  className = "",
}: BaseHeaderProps) {
  return (
    <header className={`bg-background/70 backdrop-blur-sm border border-border shadow-sm rounded-2xl sm:rounded-4xl mx-2 sm:mx-4 mt-2 sm:mt-4 mb-4 sm:mb-6 sticky top-2 sm:top-4 z-50 ${className}`}>
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-3 sm:hidden">
          <div className="flex items-center justify-between">
            {showBackButton && (
              <Link
                to={backTo}
                className="flex items-center space-x-2 text-foreground/70 hover:text-foreground transition-colors duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{backLabel}</span>
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Icon className="text-lg text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {title}
                </h1>
              </div>
            </div>
          </div>
          
          {additionalContent && (
            <div className="flex items-center justify-between text-xs">
              {additionalContent}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="flex items-center space-x-4 lg:space-x-6">
            {showBackButton && (
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Link
                  to={backTo}
                  className="flex items-center space-x-2 text-foreground/70 hover:text-foreground transition-colors duration-200"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{backLabel}</span>
                </Link>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Icon className="text-xl lg:text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-sm md:text-xl lg:text-2xl font-bold text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="hidden lg:block text-xs lg:text-sm text-foreground/60">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {rightContent && (
            <div className="flex items-center space-x-3 lg:space-x-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

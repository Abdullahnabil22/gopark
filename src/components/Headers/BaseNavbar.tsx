import { type ReactNode } from "react";
import { Link } from "react-router";
import { type IconType } from "react-icons";

interface NavItem {
  path: string;
  label: string;
  icon: IconType;
  isActive?: boolean;
}

interface BaseNavbarProps {

  brandIcon: IconType;
  brandText: string;
  brandLink?: string;
  
  navItems: NavItem[];
  
  rightContent?: ReactNode;
  
  
  className?: string;
}

export default function BaseNavbar({
  brandIcon: BrandIcon,
  brandText,
  brandLink = "/",
  navItems,
  rightContent,
  className = "",
}: BaseNavbarProps) {
  return (
    <nav className={`bg-background/95 backdrop-blur-sm border border-border shadow-sm rounded-4xl mx-4 mt-4 mb-6 sticky top-4 z-50 ${className}`}>
      <div className="flex justify-between items-center px-6 py-4">
        <Link to={brandLink} className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <BrandIcon className="text-2xl text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">{brandText}</span>
        </Link>

        <div className="flex items-center space-x-1">
          <ul className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon, isActive }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`
                    flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="text-lg" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          {rightContent && (
            <div className="ml-4 pl-4 border-l border-border">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

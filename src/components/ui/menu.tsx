import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isSeparator?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
}

interface UserProfileSidebarProps {
  user: UserProfile;
  navItems: NavItem[];
  logoutItem: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-full w-full max-w-[256px] flex-col bg-card border-r border-border',
          className
        )}
      >
        {/* User Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground">
                  {user.initials || user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator && (
                <div className="my-2 mx-2 border-t border-border" />
              )}
              <button
                onClick={() => {
                  setActiveIndex(index);
                  item.onClick?.();
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                  activeIndex === index
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Hover background */}
                <AnimatePresence>
                  {hoveredIndex === index && activeIndex !== index && (
                    <motion.div
                      className="absolute inset-0 bg-muted/50 rounded-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                {/* Active indicator */}
                {activeIndex === index && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Active background */}
                {activeIndex === index && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-muted rounded-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <span className="relative z-10 w-4 h-4 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <button
            onClick={logoutItem.onClick}
            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-150"
          >
            <span className="w-4 h-4 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{logoutItem.icon}</span>
            <span>{logoutItem.label}</span>
          </button>
        </div>
      </aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';

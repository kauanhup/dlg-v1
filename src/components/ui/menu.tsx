import * as React from 'react';
import { motion } from 'framer-motion';
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

    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-full w-full max-w-[260px] flex-col bg-background/60 p-3',
          className
        )}
      >
        {/* User Card */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 rounded-2xl blur-xl" />
          <div className="relative bg-card/80 border border-border/40 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center ring-2 ring-primary/20">
                  <span className="text-sm font-bold text-primary-foreground">
                    {user.initials || user.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator && <div className="h-4" />}
              <motion.button
                onClick={() => {
                  setActiveIndex(index);
                  item.onClick?.();
                }}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeIndex === index
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeIndex === index && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-secondary/80 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 w-5 h-5">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            </React.Fragment>
          ))}
        </nav>

        {/* Logout */}
        <div className="pt-4 mt-4 border-t border-border/30">
          <motion.button
            onClick={logoutItem.onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="w-5 h-5">{logoutItem.icon}</span>
            <span>{logoutItem.label}</span>
          </motion.button>
        </div>
      </aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';

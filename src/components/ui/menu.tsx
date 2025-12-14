// 1. Import Dependencies
import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// 2. Define Prop Types
interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isSeparator?: boolean;
  isActive?: boolean;
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
  collapsed?: boolean;
}

// 3. Define Animation Variants
const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// 4. Create the Component
export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className, collapsed = false }, ref) => {
    return (
      <motion.aside
        ref={ref}
        className={cn(
          'flex h-full w-full flex-col bg-card/50 backdrop-blur-xl text-card-foreground',
          className
        )}
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        aria-label="User Profile Menu"
      >
        {/* User Info Header */}
        <motion.div 
          variants={itemVariants} 
          className={cn(
            "flex items-center gap-3 p-4 border-b border-border/50",
            collapsed && "justify-center"
          )}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.name}'s avatar`}
              className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-foreground">
                {user.initials || user.name.charAt(0)}
              </span>
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col truncate min-w-0">
              <span className="font-semibold text-sm text-foreground truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
        </motion.div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1" role="navigation">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator && <motion.div variants={itemVariants} className="h-4" />}
              <motion.button
                onClick={item.onClick}
                variants={itemVariants}
                className={cn(
                  "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  item.isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <span className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    <ChevronRight className={cn(
                      "ml-auto h-4 w-4 transition-all",
                      item.isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    )} />
                  </>
                )}
              </motion.button>
            </React.Fragment>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.div variants={itemVariants} className="p-3 border-t border-border/50">
          <button
            onClick={logoutItem.onClick}
            className={cn(
              "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
              collapsed && "justify-center px-2"
            )}
          >
            <span className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")}>{logoutItem.icon}</span>
            {!collapsed && <span>{logoutItem.label}</span>}
          </button>
        </motion.div>
      </motion.aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';

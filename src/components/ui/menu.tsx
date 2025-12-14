import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { avatars, type Avatar } from "@/components/ui/avatar-picker";

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
  selectedAvatarId?: number;
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
  onAvatarChange?: (avatar: Avatar) => void;
  activeIndex?: number | null;
  onActiveChange?: (index: number) => void;
}

export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className, onAvatarChange, activeIndex: controlledActiveIndex, onActiveChange }, ref) => {
    const [internalActiveIndex, setInternalActiveIndex] = React.useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [avatarOpen, setAvatarOpen] = React.useState(false);

    const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;

    const selectedAvatar = avatars.find(a => a.id === user.selectedAvatarId) || null;

    const handleAvatarSelect = (avatar: Avatar) => {
      onAvatarChange?.(avatar);
      setAvatarOpen(false);
    };

    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-full w-full max-w-[256px] flex-col bg-card border-r border-border',
          className
        )}
      >
        {/* User Header with Avatar Picker */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
              <PopoverTrigger asChild>
                <button className="relative group focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full">
                  {selectedAvatar ? (
                    <div className="h-11 w-11 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center transition-transform group-hover:scale-105">
                      <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">{selectedAvatar.svg}</div>
                    </div>
                  ) : user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-11 w-11 rounded-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                      <span className="text-sm font-semibold text-primary-foreground">
                        {user.initials || user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-3" sideOffset={8}>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Escolha seu avatar</p>
                  <div className="flex flex-wrap gap-2">
                    {avatars.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar)}
                        className={cn(
                          "relative w-11 h-11 rounded-md overflow-hidden border-2 transition-colors",
                          selectedAvatar?.id === avatar.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-muted-foreground hover:bg-muted/50"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {avatar.svg}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
              <motion.button
                onClick={() => {
                  if (onActiveChange) {
                    onActiveChange(index);
                  } else {
                    setInternalActiveIndex(index);
                  }
                  item.onClick?.();
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileTap={{ scale: 0.98 }}
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
              </motion.button>
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

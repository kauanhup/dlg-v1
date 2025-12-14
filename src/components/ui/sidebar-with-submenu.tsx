"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = { 
  name: string; 
  href?: string; 
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};

interface MenuProps {
  children: React.ReactNode;
  items: MenuItem[];
  isActive?: boolean;
}

const Menu = ({ children, items, isActive }: MenuProps) => {
  const [isOpened, setIsOpened] = useState(isActive);

  return (
    <div>
      <button
        className={cn(
          "w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-150",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        )}
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
      >
        <div className="flex items-center gap-x-2">{children}</div>
        <ChevronDown className={cn("w-5 h-5 transition-transform duration-150", isOpened && "rotate-180")} />
      </button>

      {isOpened && (
        <ul className="mx-4 px-2 border-l border-border text-sm font-medium">
          {items.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={item.onClick}
                className={cn(
                  "flex w-full items-center gap-x-2 p-2 rounded-lg transition-colors duration-150",
                  item.isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                {item.icon && <div className="w-4 h-4">{item.icon}</div>}
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface SidebarWithSubmenuProps {
  user: {
    name: string;
    email: string;
    plan?: string;
    avatarUrl?: string;
    initials?: string;
  };
  navigation: MenuItem[];
  footerNavigation?: MenuItem[];
  nestedNavItems?: { label: string; icon?: React.ReactNode; items: MenuItem[] }[];
  onLogout?: () => void;
  className?: string;
}

export const SidebarWithSubmenu = ({
  user,
  navigation,
  footerNavigation = [],
  nestedNavItems = [],
  onLogout,
  className,
}: SidebarWithSubmenuProps) => {
  const profileRef = useRef<HTMLButtonElement | null>(null);
  const [isProfileActive, setIsProfileActive] = useState(false);

  useEffect(() => {
    const handleProfile = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileActive(false);
      }
    };
    document.addEventListener("click", handleProfile);
    return () => document.removeEventListener("click", handleProfile);
  }, []);

  return (
    <nav className={cn("h-full border-r border-border bg-card/50 backdrop-blur-xl", className)}>
      <div className="flex flex-col h-full px-4">
        {/* User Profile Header */}
        <div className="h-20 flex items-center pl-2">
          <div className="w-full flex items-center gap-x-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-10 h-10 rounded-full object-cover"
                alt={`${user.name}'s avatar`}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {user.initials || user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="block text-foreground text-sm font-semibold truncate">{user.name}</span>
              <span className="block mt-px text-muted-foreground text-xs truncate">
                {user.plan || user.email}
              </span>
            </div>

            <div className="relative">
              <button
                ref={profileRef}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                onClick={() => setIsProfileActive((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isProfileActive}
              >
                <ChevronUp className={cn("w-5 h-5 transition-transform", isProfileActive && "rotate-180")} />
              </button>

              {isProfileActive && (
                <div
                  role="menu"
                  className="absolute z-50 top-12 right-0 w-64 rounded-lg bg-popover border border-border shadow-lg text-sm"
                >
                  <div className="p-2">
                    <span className="block text-muted-foreground p-2 truncate">{user.email}</span>
                    {onLogout && (
                      <button 
                        onClick={onLogout}
                        className="block w-full p-2 text-left rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Sair
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="overflow-auto flex-1">
          <ul className="text-sm font-medium space-y-1">
            {navigation.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={item.onClick}
                  className={cn(
                    "flex w-full items-center gap-x-2 p-2 rounded-lg transition-colors duration-150",
                    item.isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {item.icon && <div className="w-5 h-5">{item.icon}</div>}
                  {item.name}
                </button>
              </li>
            ))}

            {nestedNavItems.map((nested, idx) => (
              <li key={`nested-${idx}`}>
                <Menu 
                  items={nested.items} 
                  isActive={nested.items.some(i => i.isActive)}
                >
                  {nested.icon && <div className="w-5 h-5">{nested.icon}</div>}
                  {nested.label}
                </Menu>
              </li>
            ))}
          </ul>

          {footerNavigation.length > 0 && (
            <div className="pt-2 mt-2 border-t border-border">
              <ul className="text-sm font-medium space-y-1">
                {footerNavigation.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={item.onClick}
                      className={cn(
                        "flex w-full items-center gap-x-2 p-2 rounded-lg transition-colors duration-150",
                        item.isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {item.icon && <div className="w-5 h-5">{item.icon}</div>}
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SidebarWithSubmenu;

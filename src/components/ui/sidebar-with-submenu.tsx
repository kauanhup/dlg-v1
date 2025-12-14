"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
          "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
          isActive 
            ? "bg-gradient-primary text-primary-foreground shadow-lg glow-sm" 
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        )}
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
      >
        <div className="flex items-center gap-x-3">{children}</div>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpened && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpened && (
          <motion.ul 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-5 mt-1 pl-4 border-l border-border/50 text-sm font-medium overflow-hidden"
          >
            {items.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={item.onClick}
                  className={cn(
                    "flex w-full items-center gap-x-2 py-2.5 px-3 rounded-lg transition-all duration-200",
                    item.isActive 
                      ? "bg-primary/15 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  )}
                >
                  {item.icon && <div className="w-4 h-4">{item.icon}</div>}
                  {item.name}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
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
    <nav className={cn("h-full border-r border-border/50 bg-sidebar-background relative noise", className)}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-glow opacity-50 pointer-events-none" />
      
      <div className="flex flex-col h-full px-4 relative z-10">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-2 border-b border-border/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-sm">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">SWEX</span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Dashboard</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="py-4 border-b border-border/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/60 transition-colors cursor-pointer">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-primary/20"
                alt={`${user.name}'s avatar`}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-sm font-bold text-primary-foreground">
                  {user.initials || user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="block text-foreground text-sm font-semibold truncate">{user.name}</span>
              <span className="block text-xs text-muted-foreground truncate">
                {user.plan || user.email}
              </span>
            </div>

            <div className="relative">
              <button
                ref={profileRef}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all"
                onClick={() => setIsProfileActive((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isProfileActive}
              >
                <ChevronUp className={cn("w-4 h-4 transition-transform duration-200", isProfileActive && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    className="absolute z-50 top-12 right-0 w-56 rounded-xl glass-strong shadow-2xl text-sm overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-muted-foreground truncate border-b border-border/50 mb-1">
                        {user.email}
                      </div>
                      {onLogout && (
                        <button 
                          onClick={onLogout}
                          className="flex items-center gap-2 w-full p-2.5 text-left rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="overflow-auto flex-1 py-4">
          <span className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 block">Menu</span>
          <ul className="text-sm font-medium space-y-1">
            {navigation.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={item.onClick}
                  className={cn(
                    "flex w-full items-center gap-x-3 p-3 rounded-xl transition-all duration-200 group",
                    item.isActive 
                      ? "bg-gradient-primary text-primary-foreground shadow-lg glow-sm" 
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    item.isActive && "drop-shadow-lg"
                  )}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
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
                  <span className="font-medium">{nested.label}</span>
                </Menu>
              </li>
            ))}
          </ul>

          {footerNavigation.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border/30">
              <span className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 block">Suporte</span>
              <ul className="text-sm font-medium space-y-1">
                {footerNavigation.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={item.onClick}
                      className={cn(
                        "flex w-full items-center gap-x-3 p-3 rounded-xl transition-all duration-200",
                        item.isActive 
                          ? "bg-gradient-primary text-primary-foreground shadow-lg" 
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      {item.icon && <div className="w-5 h-5">{item.icon}</div>}
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        <div className="p-3 mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-4 glow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <Sparkles className="w-5 h-5 text-primary-foreground mb-2" />
              <p className="text-sm font-semibold text-primary-foreground">Upgrade para Pro</p>
              <p className="text-xs text-primary-foreground/70 mt-0.5">Desbloqueie todos os recursos</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SidebarWithSubmenu;

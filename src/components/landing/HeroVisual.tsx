import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";

const floatingFeatures = [
  { icon: Clock, label: "Delay Inteligente", x: 2, y: 20, delay: 0 },
  { icon: Users, label: "Multi-Contas", x: 75, y: 8, delay: 0.1 },
  { icon: Shield, label: "Anti-Ban", x: 80, y: 70, delay: 0.2 },
  { icon: Send, label: "Extração", x: 0, y: 72, delay: 0.3 },
  { icon: Zap, label: "Automação", x: 38, y: 92, delay: 0.4 },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[260px] xs:max-w-xs sm:max-w-sm lg:max-w-md mx-auto h-[240px] xs:h-[280px] sm:h-[340px] lg:h-[380px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full bg-primary/8 blur-[80px]" />
      </div>

      {/* Connection lines - z-index 0, behind everything */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden xs:block z-0">
        {floatingFeatures.map((item, index) => (
          <line
            key={index}
            x1="50%"
            y1="50%"
            x2={`${item.x + 10}%`}
            y2={`${item.y + 4}%`}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeOpacity="0.25"
          />
        ))}
      </svg>

      {/* Central core - z-index 10 */}
      <div className="relative w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52 z-10">
        {/* Outer orbit ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.3) 10%, transparent 20%)"
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Main ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-primary/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 12px 3px hsl(var(--primary) / 0.6)" }}
          />
        </motion.div>

        {/* Secondary ring */}
        <motion.div
          className="absolute inset-5 xs:inset-6 sm:inset-8 rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/70" />
        </motion.div>

        {/* Inner glow core */}
        <div className="absolute inset-8 xs:inset-10 sm:inset-12 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-lg" />

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Inner glowing circle */}
          <div className="absolute w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 blur-xl" />
          
          {/* Telegram icon */}
          <svg 
            viewBox="0 0 24 24" 
            className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
            style={{ filter: "drop-shadow(0 0 24px hsl(var(--primary) / 0.5))" }}
          >
            <defs>
              <linearGradient id="telegramGradientPro" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 85%, 55%)" />
                <stop offset="100%" stopColor="hsl(211, 100%, 45%)" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#telegramGradientPro)"
              d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            />
          </svg>
        </div>
      </div>

      {/* Floating feature badges - z-index 20, above lines */}
      {floatingFeatures.map((item, index) => (
        <motion.div
          key={index}
          className="absolute hidden xs:flex z-20"
          style={{ 
            left: `${item.x}%`, 
            top: `${item.y}%`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: item.delay }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-background border border-border/50 shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <item.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary" />
            </div>
            <span className="text-[9px] sm:text-[11px] md:text-xs font-medium text-foreground/90 whitespace-nowrap">{item.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";

const floatingFeatures = [
  { icon: Clock, label: "Delay Inteligente", x: 2, y: 20, delay: 0, curve: -30 },
  { icon: Users, label: "Multi-Contas", x: 75, y: 8, delay: 0.1, curve: 25 },
  { icon: Shield, label: "Anti-Ban", x: 80, y: 70, delay: 0.2, curve: 35 },
  { icon: Send, label: "Extração", x: 0, y: 72, delay: 0.3, curve: -40 },
  { icon: Zap, label: "Automação", x: 38, y: 92, delay: 0.4, curve: 20 },
];

// Generate curved path between two points
const getCurvedPath = (x1: number, y1: number, x2: number, y2: number, curve: number) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const norm = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / norm * curve;
  const perpY = dx / norm * curve;
  const ctrlX = midX + perpX;
  const ctrlY = midY + perpY;
  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
};

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[260px] xs:max-w-xs sm:max-w-sm lg:max-w-md mx-auto h-[240px] xs:h-[280px] sm:h-[340px] lg:h-[380px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-40 h-40 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full bg-primary/10 blur-[80px]"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Curved connection lines with animated gradient */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden xs:block z-0">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          {floatingFeatures.map((_, index) => (
            <linearGradient key={`grad-${index}`} id={`flowGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <animate
                attributeName="x1"
                values="-100%;100%"
                dur={`${2 + index * 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0%;200%"
                dur={`${2 + index * 0.3}s`}
                repeatCount="indefinite"
              />
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {floatingFeatures.map((item, index) => {
          const centerX = 50;
          const centerY = 50;
          const endX = item.x + 10;
          const endY = item.y + 4;
          const path = getCurvedPath(centerX, centerY, endX, endY, item.curve);
          return (
            <g key={index}>
              {/* Base line */}
              <path
                d={path}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Animated energy flow */}
              <path
                d={path}
                fill="none"
                stroke={`url(#flowGradient${index})`}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          );
        })}
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
          className="absolute hidden xs:flex z-20 group cursor-default"
          style={{ 
            left: `${item.x}%`, 
            top: `${item.y}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -6, 0],
          }}
          transition={{ 
            opacity: { duration: 0.5, delay: item.delay },
            scale: { duration: 0.5, delay: item.delay },
            y: { 
              duration: 3 + index * 0.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: index * 0.3
            }
          }}
          whileHover={{ scale: 1.08, y: -8 }}
        >
          {/* Outer glow - pulsing */}
          <motion.div 
            className="absolute -inset-2 rounded-2xl bg-primary/15 blur-xl"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
          />
          
          {/* Gradient border wrapper */}
          <motion.div 
            className="relative p-[1px] rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.5) 0%, hsl(var(--border) / 0.3) 50%, hsl(var(--primary) / 0.3) 100%)"
            }}
          >
            {/* Rotating border glow */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.6) 10%, transparent 20%, transparent 100%)"
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner content */}
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-[11px] bg-background/98 backdrop-blur-md shadow-lg shadow-black/40">
              {/* Icon container with pulse effect */}
              <motion.div 
                className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 hsl(var(--primary) / 0)",
                    "0 0 12px 3px hsl(var(--primary) / 0.4)",
                    "0 0 0 0 hsl(var(--primary) / 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              >
                <item.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
              </motion.div>
              
              {/* Text */}
              <span className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-foreground whitespace-nowrap tracking-wide">
                {item.label}
              </span>
              
              {/* Top highlight line */}
              <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              
              {/* Bottom subtle reflection */}
              <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

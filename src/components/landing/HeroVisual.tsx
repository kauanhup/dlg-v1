import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

const features = [
  { icon: Clock, label: "Delay Inteligente", x: 82, y: 18 },
  { icon: Users, label: "Multi-Contas", x: 88, y: 42 },
  { icon: Shield, label: "Anti-Ban", x: 82, y: 66 },
  { icon: Send, label: "Extração", x: 18, y: 42 },
  { icon: Zap, label: "Automação", x: 50, y: 85 },
];

export const HeroVisual = () => {
  const centerX = 50;
  const centerY = 48;

  return (
    <div className="relative w-full max-w-[420px] lg:max-w-[480px] mx-auto h-[380px] sm:h-[420px] lg:h-[450px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
      </div>

      {/* SVG Lines - connecting center to badges */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="lineGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Lines to each feature */}
        {features.map((item, index) => {
          const isLeft = item.x < 50;
          return (
            <motion.line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={item.x}
              y2={item.y}
              stroke={isLeft ? "url(#lineGradLeft)" : "url(#lineGradRight)"}
              strokeWidth="0.25"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.08 }}
            />
          );
        })}
        
        {/* Line to logo */}
        <motion.line
          x1={centerX}
          y1={centerY}
          x2={18}
          y2={72}
          stroke="url(#lineGradLeft)"
          strokeWidth="0.25"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />
        
        {/* Small dots at line endpoints */}
        {features.map((item, index) => (
          <motion.circle
            key={`dot-${index}`}
            cx={item.x}
            cy={item.y}
            r="0.5"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.6 + index * 0.08 }}
          />
        ))}
        <motion.circle
          cx={18}
          cy={72}
          r="0.5"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.9 }}
        />
      </svg>

      {/* Central Telegram Icon */}
      <motion.div 
        className="absolute z-10"
        style={{ left: `${centerX}%`, top: `${centerY}%`, transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute -inset-6 sm:-inset-8 rounded-full border border-primary/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
        </motion.div>
        
        {/* Inner glow */}
        <div className="absolute -inset-10 rounded-full bg-primary/6 blur-2xl" />
        
        {/* Icon container */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-background via-background to-muted/20 border border-border/30 flex items-center justify-center shadow-2xl">
          <svg 
            viewBox="0 0 24 24" 
            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18"
            style={{ filter: "drop-shadow(0 0 24px hsl(var(--primary) / 0.3))" }}
          >
            <defs>
              <linearGradient id="telegramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 85%, 55%)" />
                <stop offset="100%" stopColor="hsl(211, 100%, 45%)" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#telegramGrad)"
              d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Logo badge */}
      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '18%', top: '72%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <div className="w-12 h-12 rounded-full bg-background/95 border border-border/40 shadow-lg flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors">
          <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
        </div>
      </motion.div>

      {/* Feature badges - positioned to match SVG coordinates */}
      {features.map((item, index) => (
        <motion.div
          key={index}
          className="absolute z-20 hidden sm:flex"
          style={{ 
            left: `${item.x}%`, 
            top: `${item.y}%`,
            transform: "translate(-50%, -50%)"
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/95 border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <item.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              {item.label}
            </span>
          </div>
        </motion.div>
      ))}

      {/* Mobile layout */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 sm:hidden">
        {features.slice(0, 3).map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background/90 border border-border/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          >
            <item.icon className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-foreground">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

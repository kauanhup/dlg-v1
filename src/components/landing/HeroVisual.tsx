import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";

const features = [
  { icon: Clock, label: "Delay Inteligente", angle: -60 },
  { icon: Users, label: "Multi-Contas", angle: -15 },
  { icon: Shield, label: "Anti-Ban", angle: 30 },
  { icon: Send, label: "Extração", angle: 165 },
  { icon: Zap, label: "Automação", angle: 120 },
];

export const HeroVisual = () => {
  const radius = 140;
  const centerX = 50;
  const centerY = 50;

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto h-[300px] sm:h-[360px] lg:h-[400px] flex items-center justify-center">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary/8 blur-[60px]" />
      </div>

      {/* SVG Mind Map Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        
        {features.map((item, index) => {
          const angleRad = (item.angle * Math.PI) / 180;
          const endX = centerX + Math.cos(angleRad) * 38;
          const endY = centerY + Math.sin(angleRad) * 38;
          
          return (
            <motion.line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="url(#lineGrad)"
              strokeWidth="0.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
            />
          );
        })}
        
        {/* Connection dots at endpoints */}
        {features.map((item, index) => {
          const angleRad = (item.angle * Math.PI) / 180;
          const dotX = centerX + Math.cos(angleRad) * 38;
          const dotY = centerY + Math.sin(angleRad) * 38;
          
          return (
            <motion.circle
              key={`dot-${index}`}
              cx={dotX}
              cy={dotY}
              r="1"
              fill="hsl(var(--primary))"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Central Telegram Icon */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute -inset-4 sm:-inset-6 rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" />
        </motion.div>
        
        {/* Inner glow */}
        <div className="absolute -inset-6 sm:-inset-8 rounded-full bg-primary/10 blur-xl" />
        
        {/* Icon container */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-background via-background to-muted/30 border border-border/50 flex items-center justify-center shadow-xl shadow-black/20">
          <svg 
            viewBox="0 0 24 24" 
            className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
            style={{ filter: "drop-shadow(0 0 16px hsl(var(--primary) / 0.4))" }}
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

      {/* Feature badges positioned around */}
      {features.map((item, index) => {
        const angleRad = (item.angle * Math.PI) / 180;
        const x = 50 + Math.cos(angleRad) * 42;
        const y = 50 + Math.sin(angleRad) * 42;
        
        return (
          <motion.div
            key={index}
            className="absolute z-20 hidden sm:flex"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`,
              transform: "translate(-50%, -50%)"
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border/60 shadow-lg shadow-black/10 hover:border-primary/30 transition-colors duration-300">
              <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                <item.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Mobile: Show badges in simpler layout */}
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

import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

const features = [
  { icon: Clock, label: "Delay Inteligente", x: 85, y: 12 },
  { icon: Users, label: "Multi-Contas", x: 92, y: 35 },
  { icon: Shield, label: "Anti-Ban", x: 88, y: 60 },
  { icon: Send, label: "Extração", x: 8, y: 48 },
  { icon: Zap, label: "Automação", x: 55, y: 85 },
];

// Generate smooth curved path
const getCurvedPath = (startX: number, startY: number, endX: number, endY: number) => {
  const midX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - 10;
  return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
};

export const HeroVisual = () => {
  const centerX = 45;
  const centerY = 45;

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px] mx-auto h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary/8 blur-[60px]" />
      </div>

      {/* SVG Curved Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="curveGradReverse" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {features.map((item, index) => {
          const isLeft = item.x < 50;
          const path = getCurvedPath(centerX, centerY, item.x, item.y);
          
          return (
            <motion.path
              key={index}
              d={path}
              fill="none"
              stroke={isLeft ? "url(#curveGradReverse)" : "url(#curveGrad)"}
              strokeWidth="0.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 + index * 0.12, ease: "easeOut" }}
            />
          );
        })}
        
        {/* Line to logo (bottom left) */}
        <motion.path
          d={getCurvedPath(centerX, centerY, 12, 78)}
          fill="none"
          stroke="url(#curveGradReverse)"
          strokeWidth="0.4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        />
        
        {/* Connection dots */}
        {features.map((item, index) => (
          <motion.circle
            key={`dot-${index}`}
            cx={item.x}
            cy={item.y}
            r="0.8"
            fill="hsl(var(--primary))"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
          />
        ))}
        
        {/* Logo dot */}
        <motion.circle
          cx={12}
          cy={78}
          r="0.8"
          fill="hsl(var(--primary))"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        />
      </svg>

      {/* Central Telegram Icon */}
      <motion.div 
        className="absolute z-10"
        style={{ left: '45%', top: '45%', transform: 'translate(-50%, -50%)' }}
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
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-background via-background to-muted/30 border border-border/50 flex items-center justify-center shadow-xl shadow-black/20">
          <svg 
            viewBox="0 0 24 24" 
            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
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

      {/* Logo badge (bottom left) */}
      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '12%', top: '78%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border/60 shadow-lg shadow-black/10 hover:border-primary/30 transition-colors duration-300 overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
        </div>
      </motion.div>

      {/* Feature badges */}
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
          transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
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
      ))}

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

import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

const features = [
  { icon: Clock, label: "Delay Inteligente", x: 78, y: 15 },
  { icon: Users, label: "Multi-Contas", x: 85, y: 40 },
  { icon: Shield, label: "Anti-Ban", x: 78, y: 65 },
  { icon: Send, label: "Extração", x: 22, y: 40 },
  { icon: Zap, label: "Automação", x: 50, y: 82 },
];

// Generate smooth curved path
const getCurvedPath = (startX: number, startY: number, endX: number, endY: number) => {
  const dx = endX - startX;
  const dy = endY - startY;
  const midX = startX + dx * 0.5;
  const midY = startY + dy * 0.5;
  
  // Add curve based on direction
  const curveOffset = dx > 0 ? -8 : 8;
  const ctrlX = midX;
  const ctrlY = midY + curveOffset;
  
  return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
};

export const HeroVisual = () => {
  const centerX = 50;
  const centerY = 45;

  return (
    <div className="relative w-full max-w-[400px] lg:max-w-[460px] mx-auto h-[350px] sm:h-[400px] lg:h-[420px] flex items-center justify-center">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-primary/8 blur-[70px]" />
      </div>

      {/* SVG Curved Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        
        {features.map((item, index) => {
          const path = getCurvedPath(centerX, centerY, item.x, item.y);
          
          return (
            <motion.path
              key={index}
              d={path}
              fill="none"
              stroke="url(#curveGrad)"
              strokeWidth="0.3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeOut" }}
            />
          );
        })}
        
        {/* Line to logo */}
        <motion.path
          d={getCurvedPath(centerX, centerY, 22, 70)}
          fill="none"
          stroke="url(#curveGrad)"
          strokeWidth="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        />
        
        {/* Connection dots */}
        {features.map((item, index) => (
          <motion.circle
            key={`dot-${index}`}
            cx={item.x}
            cy={item.y}
            r="0.6"
            fill="hsl(var(--primary))"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.3, delay: 0.7 + index * 0.08 }}
          />
        ))}
        
        {/* Logo dot */}
        <motion.circle
          cx={22}
          cy={70}
          r="0.6"
          fill="hsl(var(--primary))"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.3, delay: 1 }}
        />
      </svg>

      {/* Central Telegram Icon */}
      <motion.div 
        className="absolute z-10"
        style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute -inset-5 sm:-inset-7 rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/50" />
        </motion.div>
        
        {/* Inner glow */}
        <div className="absolute -inset-8 rounded-full bg-primary/8 blur-xl" />
        
        {/* Icon container */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-background via-background to-muted/20 border border-border/40 flex items-center justify-center shadow-2xl shadow-black/30">
          <svg 
            viewBox="0 0 24 24" 
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
            style={{ filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.35))" }}
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
        style={{ left: '22%', top: '70%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg hover:border-primary/30 transition-colors duration-300 overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
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
          transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg hover:border-primary/30 transition-colors duration-300">
            <div className="w-6 h-6 rounded-md bg-primary/12 flex items-center justify-center">
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

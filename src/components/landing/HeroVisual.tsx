import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[380px] lg:max-w-[420px] mx-auto h-[340px] sm:h-[380px] lg:h-[400px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full bg-primary/8 blur-[80px]" />
      </div>

      {/* SVG Curved lines */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 400 400"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lineGradR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="lineGradL" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Curved lines from center (200, 200) to badges */}
        {/* To Delay Inteligente (top right) */}
        <motion.path 
          d="M 200 200 Q 280 140, 340 80" 
          stroke="url(#lineGradR)" 
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        {/* To Multi-Contas (right) */}
        <motion.path 
          d="M 200 200 Q 300 180, 350 160" 
          stroke="url(#lineGradR)" 
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        {/* To Anti-Ban (bottom right) */}
        <motion.path 
          d="M 200 200 Q 290 250, 340 280" 
          stroke="url(#lineGradR)" 
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        {/* To Extração (left) */}
        <motion.path 
          d="M 200 200 Q 120 170, 60 160" 
          stroke="url(#lineGradL)" 
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        {/* To Automação (bottom) */}
        <motion.path 
          d="M 200 200 Q 230 300, 260 340" 
          stroke="url(#lineGradR)" 
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
        {/* To Logo (bottom left) */}
        <motion.path 
          d="M 200 200 Q 120 260, 70 300" 
          stroke="url(#lineGradL)" 
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />
      </svg>

      {/* Central Telegram Icon - simplified */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Subtle glow */}
        <div className="absolute -inset-6 rounded-full bg-primary/10 blur-xl" />
        
        {/* Icon container */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-background via-background to-muted/20 border border-border/30 flex items-center justify-center shadow-xl">
          <svg 
            viewBox="0 0 24 24" 
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
            style={{ filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.4))" }}
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

      {/* Feature badges - repositioned closer to center */}
      
      {/* Delay Inteligente - top right */}
      <motion.div
        className="absolute hidden sm:flex top-[12%] right-[8%] z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Clock className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-foreground">Delay Inteligente</span>
        </div>
      </motion.div>

      {/* Multi-Contas - right */}
      <motion.div
        className="absolute hidden sm:flex top-[32%] right-[3%] z-20"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Users className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-foreground">Multi-Contas</span>
        </div>
      </motion.div>

      {/* Anti-Ban - bottom right */}
      <motion.div
        className="absolute hidden sm:flex bottom-[22%] right-[8%] z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Shield className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-foreground">Anti-Ban</span>
        </div>
      </motion.div>

      {/* Extração - left */}
      <motion.div
        className="absolute hidden sm:flex top-[32%] left-[3%] z-20"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Send className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-foreground">Extração</span>
        </div>
      </motion.div>

      {/* Automação - bottom center-right */}
      <motion.div
        className="absolute hidden sm:flex bottom-[8%] right-[25%] z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-foreground">Automação</span>
        </div>
      </motion.div>

      {/* Logo - bottom left */}
      <motion.div
        className="absolute hidden sm:flex bottom-[18%] left-[10%] z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div className="w-10 h-10 rounded-full bg-background border border-border/40 shadow-lg flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors">
          <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain" />
        </div>
      </motion.div>

      {/* Mobile layout */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 sm:hidden">
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background/90 border border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Delay</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background/90 border border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Anti-Ban</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background/90 border border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Automação</span>
        </motion.div>
      </div>
    </div>
  );
};

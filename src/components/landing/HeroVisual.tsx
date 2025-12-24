import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[480px] mx-auto h-[400px] sm:h-[440px] lg:h-[480px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Decorative orbit ring */}
      <motion.div
        className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px] rounded-full border border-primary/10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Second orbit */}
      <motion.div
        className="absolute w-[200px] h-[200px] sm:w-[230px] sm:h-[230px] lg:w-[260px] lg:h-[260px] rounded-full border border-primary/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/30" />
      </motion.div>

      {/* Central Telegram Icon */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Inner glow */}
        <div className="absolute -inset-8 rounded-full bg-primary/8 blur-2xl" />
        
        {/* Icon container */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-background via-background to-muted/20 border border-border/30 flex items-center justify-center shadow-2xl">
          <svg 
            viewBox="0 0 24 24" 
            className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20"
            style={{ filter: "drop-shadow(0 0 24px hsl(var(--primary) / 0.4))" }}
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

      {/* Feature badges positioned around the circle */}
      
      {/* Delay Inteligente - top right */}
      <motion.div
        className="absolute hidden sm:flex top-[8%] right-[5%]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Delay Inteligente</span>
        </div>
      </motion.div>

      {/* Multi-Contas - right */}
      <motion.div
        className="absolute hidden sm:flex top-[35%] right-0"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Multi-Contas</span>
        </div>
      </motion.div>

      {/* Anti-Ban - bottom right */}
      <motion.div
        className="absolute hidden sm:flex bottom-[25%] right-[5%]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Anti-Ban</span>
        </div>
      </motion.div>

      {/* Extração - left */}
      <motion.div
        className="absolute hidden sm:flex top-[35%] left-0"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Extração</span>
        </div>
      </motion.div>

      {/* Automação - bottom */}
      <motion.div
        className="absolute hidden sm:flex bottom-[8%] left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Automação</span>
        </div>
      </motion.div>

      {/* Logo - bottom left */}
      <motion.div
        className="absolute hidden sm:flex bottom-[25%] left-[5%]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <div className="w-11 h-11 rounded-full bg-background border border-border/40 shadow-lg flex items-center justify-center overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-7 h-7 object-contain" />
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

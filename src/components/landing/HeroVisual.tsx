import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

const features = [
  { icon: Clock, label: "Delay Inteligente", top: "12%", left: "75%" },
  { icon: Users, label: "Multi-Contas", top: "35%", left: "82%" },
  { icon: Shield, label: "Anti-Ban", top: "58%", left: "78%" },
  { icon: Send, label: "Extração", top: "35%", left: "12%" },
  { icon: Zap, label: "Automação", top: "75%", left: "50%" },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[420px] lg:max-w-[500px] mx-auto h-[380px] sm:h-[420px] lg:h-[460px]">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
      </div>

      {/* Central Telegram Icon - positioned at center */}
      <motion.div 
        className="absolute z-10 left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2"
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
            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px]"
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

      {/* Connection lines using CSS */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad1" gradientUnits="userSpaceOnUse" x1="50%" y1="45%" x2="75%" y2="12%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {/* Lines drawn from center to each badge position */}
        <motion.line x1="50%" y1="45%" x2="75%" y2="15%" stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
        <motion.line x1="50%" y1="45%" x2="82%" y2="38%" stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
        <motion.line x1="50%" y1="45%" x2="78%" y2="61%" stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
        <motion.line x1="50%" y1="45%" x2="15%" y2="38%" stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
        <motion.line x1="50%" y1="45%" x2="50%" y2="78%" stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
        <motion.line x1="50%" y1="45%" x2="18%" y2="68%" stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.7 }} />
        
        {/* Dots at endpoints */}
        <motion.circle cx="75%" cy="15%" r="3" fill="hsl(var(--primary))" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} />
        <motion.circle cx="82%" cy="38%" r="3" fill="hsl(var(--primary))" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
        <motion.circle cx="78%" cy="61%" r="3" fill="hsl(var(--primary))" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
        <motion.circle cx="15%" cy="38%" r="3" fill="hsl(var(--primary))" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} />
        <motion.circle cx="50%" cy="78%" r="3" fill="hsl(var(--primary))" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
        <motion.circle cx="18%" cy="68%" r="3" fill="hsl(var(--primary))" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
      </svg>

      {/* Logo badge */}
      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '18%', top: '68%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <div className="w-11 h-11 rounded-full bg-background border border-border/40 shadow-lg flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors">
          <img src={logoImg} alt="Logo" className="w-7 h-7 object-contain" />
        </div>
      </motion.div>

      {/* Feature badges */}
      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '75%', top: '15%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Delay Inteligente</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '82%', top: '38%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Multi-Contas</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '78%', top: '61%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Anti-Ban</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '15%', top: '38%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Extração</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute z-20 hidden sm:flex"
        style={{ left: '50%', top: '78%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 shadow-lg hover:border-primary/30 transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Automação</span>
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

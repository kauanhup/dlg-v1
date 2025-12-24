import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";

const Badge = ({ 
  icon: Icon, 
  label, 
  delay 
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
}) => (
  <motion.div
    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border/50 shadow-md hover:border-primary/40 transition-all hover:shadow-lg"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <span className="text-xs font-medium text-foreground whitespace-nowrap">{label}</span>
  </motion.div>
);

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[400px] lg:max-w-[440px] mx-auto h-[360px] sm:h-[400px] flex items-center justify-center">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full bg-primary/10 blur-[60px]" />
      </div>

      {/* Mind map SVG lines */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 440 400"
        fill="none"
      >
        <defs>
          <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        
        {/* Mind map branches - bezier curves from center */}
        {/* Right side branches */}
        <motion.path 
          d="M 220 200 C 280 200, 320 120, 380 100" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        <motion.path 
          d="M 220 200 C 300 200, 340 200, 400 200" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.path 
          d="M 220 200 C 280 200, 320 280, 380 310" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        
        {/* Left side branches */}
        <motion.path 
          d="M 220 200 C 160 200, 100 160, 50 140" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.path 
          d="M 220 200 C 180 240, 140 300, 80 330" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        
        {/* Bottom branch */}
        <motion.path 
          d="M 220 200 C 220 260, 240 320, 260 360" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Node dots at endpoints */}
        <motion.circle cx="380" cy="100" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
        <motion.circle cx="400" cy="200" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
        <motion.circle cx="380" cy="310" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} />
        <motion.circle cx="50" cy="140" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
        <motion.circle cx="80" cy="330" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
        <motion.circle cx="260" cy="360" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} />
      </svg>

      {/* Central node - Telegram Icon */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
          <svg 
            viewBox="0 0 24 24" 
            className="w-12 h-12 sm:w-14 sm:h-14"
            style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))" }}
          >
            <defs>
              <linearGradient id="tgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 85%, 55%)" />
                <stop offset="100%" stopColor="hsl(211, 100%, 45%)" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#tgGrad)"
              d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Badges positioned at branch endpoints */}
      
      {/* Delay Inteligente - top right */}
      <div className="absolute hidden sm:block top-[18%] right-[2%]">
        <Badge icon={Clock} label="Delay Inteligente" delay={0.4} />
      </div>

      {/* Multi-Contas - middle right */}
      <div className="absolute hidden sm:block top-[45%] right-0 -translate-y-1/2">
        <Badge icon={Users} label="Multi-Contas" delay={0.5} />
      </div>

      {/* Anti-Ban - bottom right */}
      <div className="absolute hidden sm:block bottom-[15%] right-[5%]">
        <Badge icon={Shield} label="Anti-Ban" delay={0.6} />
      </div>

      {/* Extração - left */}
      <div className="absolute hidden sm:block top-[28%] left-0">
        <Badge icon={Send} label="Extração" delay={0.7} />
      </div>

      {/* Logo - bottom left */}
      <motion.div
        className="absolute hidden sm:flex bottom-[12%] left-[12%]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <div className="w-10 h-10 rounded-full bg-background border-2 border-primary/30 shadow-lg flex items-center justify-center overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain" />
        </div>
      </motion.div>

      {/* Automação - bottom center */}
      <div className="absolute hidden sm:block bottom-[2%] left-[55%]">
        <Badge icon={Zap} label="Automação" delay={0.9} />
      </div>

      {/* Mobile layout */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 sm:hidden">
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Delay</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Anti-Ban</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border/50"
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

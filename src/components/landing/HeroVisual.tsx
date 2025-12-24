import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, Monitor, Rocket } from "lucide-react";

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
    className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border/50 shadow-md cursor-default overflow-hidden"
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay,
      type: "spring",
      stiffness: 200,
      damping: 15
    }}
    whileHover={{ 
      scale: 1.08, 
      boxShadow: "0 8px 30px -8px hsl(var(--primary) / 0.4)",
      borderColor: "hsl(var(--primary) / 0.6)"
    }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Shimmer effect on hover */}
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent group-hover:translate-x-full transition-transform duration-700"
    />
    
    {/* Glow background */}
    <motion.div
      className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"
    />
    
    {/* Icon container with pulse */}
    <motion.div 
      className="relative w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center"
      animate={{ 
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0.3)",
          "0 0 0 6px hsl(var(--primary) / 0)",
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: delay + 1.5,
        ease: "easeOut"
      }}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: delay + 0.5,
          ease: "easeInOut"
        }}
      >
        <Icon className="w-3.5 h-3.5 text-primary" />
      </motion.div>
    </motion.div>
    
    <span className="relative text-xs font-medium text-foreground whitespace-nowrap">{label}</span>
  </motion.div>
);

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[380px] lg:max-w-[420px] mx-auto h-[360px] sm:h-[400px] flex items-center justify-center">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full bg-primary/10 blur-[60px]" />
      </div>

      {/* Mind map SVG lines */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 420 400"
        fill="none"
      >
        <defs>
          <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        
        {/* Mind map branches - bezier curves from center (210, 200) */}
        
        {/* Delay Inteligente - top right */}
        <motion.path 
          d="M 210 200 C 260 180, 300 120, 360 90" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        
        {/* Multi-Contas - right side */}
        <motion.path 
          d="M 210 200 C 280 190, 330 170, 380 160" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        />
        
        {/* Modo PC - middle right */}
        <motion.path 
          d="M 210 200 C 290 200, 340 230, 390 250" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        
        {/* Anti-Ban - bottom right */}
        <motion.path 
          d="M 210 200 C 260 230, 300 290, 360 320" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        />
        
        {/* Extração - left side */}
        <motion.path 
          d="M 210 200 C 150 180, 100 140, 50 120" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        
        {/* Logo - bottom left */}
        <motion.path 
          d="M 210 200 C 170 230, 130 280, 90 310" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        />
        
        {/* Automação - bottom center */}
        <motion.path 
          d="M 210 200 C 210 260, 230 310, 250 350" 
          stroke="url(#branchGrad)" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Node dots at endpoints */}
        <motion.circle cx="360" cy="90" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
        <motion.circle cx="380" cy="160" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55 }} />
        <motion.circle cx="390" cy="250" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
        <motion.circle cx="360" cy="320" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.65 }} />
        <motion.circle cx="50" cy="120" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} />
        <motion.circle cx="90" cy="310" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.75 }} />
        <motion.circle cx="250" cy="350" r="4" fill="hsl(var(--primary))" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
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
      <div className="absolute hidden sm:block top-[15%] right-[8%]">
        <Badge icon={Clock} label="Delay Inteligente" delay={0.4} />
      </div>

      {/* Multi-Contas - upper right */}
      <div className="absolute hidden sm:block top-[32%] right-[2%]">
        <Badge icon={Users} label="Multi-Contas" delay={0.45} />
      </div>

      {/* Modo PC - middle right */}
      <div className="absolute hidden sm:block top-[55%] right-[0%]">
        <Badge icon={Monitor} label="Modo PC" delay={0.5} />
      </div>

      {/* Anti-Ban - bottom right */}
      <div className="absolute hidden sm:block bottom-[12%] right-[5%]">
        <Badge icon={Shield} label="Anti-Ban" delay={0.55} />
      </div>

      {/* Extração - left */}
      <div className="absolute hidden sm:block top-[22%] left-[0%]">
        <Badge icon={Send} label="Extração" delay={0.6} />
      </div>

      {/* Crescimento - bottom left */}
      <div className="absolute hidden sm:block bottom-[18%] left-[12%]">
        <Badge icon={Rocket} label="Crescimento" delay={0.65} />
      </div>

      {/* Automação - bottom center */}
      <div className="absolute hidden sm:block bottom-[5%] left-[52%]">
        <Badge icon={Zap} label="Automação" delay={0.7} />
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

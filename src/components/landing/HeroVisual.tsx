import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, Monitor, Rocket } from "lucide-react";
import { usePrefersReducedMotion, gpuEase } from "@/hooks/useScrollAnimation";

// Simplified floating badge - GPU optimized
const Badge = ({ 
  icon: Icon, 
  label, 
  delay,
  floatOffset = 0
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
  floatOffset?: number;
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg cursor-default"
      style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: prefersReducedMotion ? 0 : [0, -4, 0]
      }}
      transition={{ 
        opacity: { duration: 0.4, delay },
        scale: { duration: 0.4, delay, ease: gpuEase },
        y: {
          duration: 4 + floatOffset,
          delay: delay + 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      whileHover={{ 
        scale: 1.08, 
        borderColor: "hsl(var(--primary) / 0.6)"
      }}
    >
      <div className="relative w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-xs font-semibold text-foreground whitespace-nowrap">{label}</span>
    </motion.div>
  );
};

// Simplified animated line - no particle animation for performance
const AnimatedLine = ({ 
  d, 
  delay 
}: { 
  d: string; 
  delay: number;
}) => (
  <motion.path 
    d={d}
    stroke="url(#branchGrad)" 
    strokeWidth="2"
    strokeLinecap="round"
    fill="none"
    style={{ willChange: "stroke-dashoffset, opacity" }}
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 1, delay, ease: "easeOut" }}
  />
);

export const HeroVisual = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative w-full max-w-[380px] lg:max-w-[420px] mx-auto h-[360px] sm:h-[400px] flex items-center justify-center">
      {/* Simplified ambient glow - static if reduced motion */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-48 h-48 rounded-full bg-primary/20 blur-[70px]"
          style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Mind map SVG lines */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 420 400"
        fill="none"
      >
        <defs>
          <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        
        {/* Lines connecting to badges - distributed around the center */}
        {/* Top right - Delay Inteligente */}
        <AnimatedLine d="M 210 200 Q 280 140, 350 80" delay={0.1} />
        
        {/* Right upper - Multi-Contas */}
        <AnimatedLine d="M 210 200 Q 300 180, 370 155" delay={0.15} />
        
        {/* Right middle - Modo PC */}
        <AnimatedLine d="M 210 200 Q 300 210, 380 230" delay={0.2} />
        
        {/* Right lower - Anti-Ban */}
        <AnimatedLine d="M 210 200 Q 280 270, 350 320" delay={0.25} />
        
        {/* Top left - Extração */}
        <AnimatedLine d="M 210 200 Q 140 140, 55 95" delay={0.3} />
        
        {/* Bottom left - Crescimento */}
        <AnimatedLine d="M 210 200 Q 140 270, 85 320" delay={0.35} />
        
        {/* Bottom center - Automação */}
        <AnimatedLine d="M 210 200 Q 210 280, 210 360" delay={0.4} />
        
        {/* Central pulsing ring - only if not reduced motion */}
        {!prefersReducedMotion && (
          <motion.circle
            cx="210"
            cy="200"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: [0.9, 1.3, 1.5],
              opacity: [0.4, 0.15, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </svg>

      {/* Central node - Telegram Icon */}
      <motion.div 
        className="relative z-10"
        style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: gpuEase
        }}
      >
        {/* Outer glow */}
        <div className="absolute -inset-6 rounded-full bg-primary/15 blur-xl" />
        
        {/* Main container */}
        <motion.div 
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center shadow-2xl border border-border/30"
          style={{ 
            boxShadow: "0 0 40px -5px hsl(var(--primary) / 0.4)",
            willChange: prefersReducedMotion ? "auto" : "box-shadow"
          }}
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              "0 0 40px -5px hsl(var(--primary) / 0.4)",
              "0 0 50px -5px hsl(var(--primary) / 0.5)",
              "0 0 40px -5px hsl(var(--primary) / 0.4)"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Telegram icon */}
          <motion.svg 
            viewBox="0 0 24 24" 
            className="w-12 h-12 sm:w-14 sm:h-14 relative z-10"
            style={{ filter: "drop-shadow(0 0 15px hsl(var(--primary) / 0.5))" }}
          >
            <defs>
              <linearGradient id="tgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 90%, 60%)" />
                <stop offset="50%" stopColor="hsl(205, 95%, 50%)" />
                <stop offset="100%" stopColor="hsl(211, 100%, 45%)" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#tgGrad)"
              d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Badges distributed around the logo - better positioning */}
      {/* Top right - Delay Inteligente */}
      <div className="absolute hidden sm:block" style={{ top: '12%', right: '5%' }}>
        <Badge icon={Clock} label="Delay Inteligente" delay={0.3} floatOffset={0} />
      </div>

      {/* Right upper - Multi-Contas */}
      <div className="absolute hidden sm:block" style={{ top: '32%', right: '0%' }}>
        <Badge icon={Users} label="Multi-Contas" delay={0.35} floatOffset={0.3} />
      </div>

      {/* Right middle - Modo PC */}
      <div className="absolute hidden sm:block" style={{ top: '52%', right: '2%' }}>
        <Badge icon={Monitor} label="Modo PC" delay={0.4} floatOffset={0.6} />
      </div>

      {/* Right lower - Anti-Ban */}
      <div className="absolute hidden sm:block" style={{ bottom: '15%', right: '8%' }}>
        <Badge icon={Shield} label="Anti-Ban" delay={0.45} floatOffset={0.2} />
      </div>

      {/* Top left - Extração */}
      <div className="absolute hidden sm:block" style={{ top: '18%', left: '0%' }}>
        <Badge icon={Send} label="Extração" delay={0.5} floatOffset={0.5} />
      </div>

      {/* Bottom left - Crescimento */}
      <div className="absolute hidden sm:block" style={{ bottom: '15%', left: '5%' }}>
        <Badge icon={Rocket} label="Crescimento" delay={0.55} floatOffset={0.4} />
      </div>

      {/* Bottom center - Automação */}
      <div className="absolute hidden sm:block" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}>
        <Badge icon={Zap} label="Automação" delay={0.6} floatOffset={0.1} />
      </div>

      {/* Mobile layout */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 sm:hidden">
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Delay</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Anti-Ban</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Automação</span>
        </motion.div>
      </div>
    </div>
  );
};

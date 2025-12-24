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

// Animated line component with energy flow
const AnimatedLine = ({ 
  d, 
  delay 
}: { 
  d: string; 
  delay: number;
}) => (
  <g>
    <motion.path 
      d={d}
      stroke="url(#branchGrad)" 
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    />
    {/* Energy flow dot */}
    <motion.circle
      r="3"
      fill="hsl(var(--primary))"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 2.5,
        delay: delay + 1.2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
      }}
    >
      <animateMotion
        dur="2.5s"
        repeatCount="indefinite"
        begin={`${delay + 1.2}s`}
        path={d}
      />
    </motion.circle>
  </g>
);

// Pulsing node dot
const PulsingDot = ({ 
  cx, 
  cy, 
  delay 
}: { 
  cx: number; 
  cy: number; 
  delay: number;
}) => (
  <g>
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="4" 
      fill="hsl(var(--primary))" 
      fillOpacity="0.8"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 15 }}
    />
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="4" 
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="1.5"
      initial={{ scale: 1, opacity: 0 }}
      animate={{ 
        scale: [1, 2.5, 3],
        opacity: [0.6, 0.3, 0]
      }}
      transition={{
        duration: 2,
        delay: delay + 0.5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeOut"
      }}
    />
  </g>
);

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[380px] lg:max-w-[420px] mx-auto h-[360px] sm:h-[400px] flex items-center justify-center">
      {/* Animated ambient glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-40 h-40 rounded-full bg-primary/15 blur-[60px]" />
      </motion.div>
      
      {/* Secondary rotating glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-[40px]" />
      </motion.div>

      {/* Mind map SVG lines */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 420 400"
        fill="none"
      >
        <defs>
          <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g filter="url(#glow)">
          {/* Delay Inteligente - top right */}
          <AnimatedLine d="M 210 200 C 260 180, 300 120, 360 90" delay={0.1} />
          
          {/* Multi-Contas - right side */}
          <AnimatedLine d="M 210 200 C 280 190, 330 170, 380 160" delay={0.15} />
          
          {/* Modo PC - middle right */}
          <AnimatedLine d="M 210 200 C 290 200, 340 230, 390 250" delay={0.2} />
          
          {/* Anti-Ban - bottom right */}
          <AnimatedLine d="M 210 200 C 260 230, 300 290, 360 320" delay={0.25} />
          
          {/* Extração - left side */}
          <AnimatedLine d="M 210 200 C 150 180, 100 140, 50 120" delay={0.3} />
          
          {/* Crescimento - bottom left */}
          <AnimatedLine d="M 210 200 C 170 230, 130 280, 90 310" delay={0.35} />
          
          {/* Automação - bottom center */}
          <AnimatedLine d="M 210 200 C 210 260, 230 310, 250 350" delay={0.4} />
        </g>

        {/* Pulsing node dots at endpoints */}
        <PulsingDot cx={360} cy={90} delay={0.5} />
        <PulsingDot cx={380} cy={160} delay={0.55} />
        <PulsingDot cx={390} cy={250} delay={0.6} />
        <PulsingDot cx={360} cy={320} delay={0.65} />
        <PulsingDot cx={50} cy={120} delay={0.7} />
        <PulsingDot cx={90} cy={310} delay={0.75} />
        <PulsingDot cx={250} cy={350} delay={0.8} />
        
        {/* Central pulsing ring */}
        <motion.circle
          cx="210"
          cy="200"
          r="50"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 1.5],
            opacity: [0.5, 0.2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </svg>

      {/* Central node - Telegram Icon */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
      >
        {/* Outer glow ring */}
        <motion.div 
          className="absolute -inset-6 rounded-full bg-primary/5"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Inner glow */}
        <motion.div 
          className="absolute -inset-4 rounded-full bg-primary/10 blur-xl"
          animate={{ 
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main container with hover effect */}
        <motion.div 
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center shadow-xl"
          style={{ boxShadow: "0 0 30px -5px hsl(var(--primary) / 0.3)" }}
          animate={{
            boxShadow: [
              "0 0 30px -5px hsl(var(--primary) / 0.3)",
              "0 0 50px -5px hsl(var(--primary) / 0.5)",
              "0 0 30px -5px hsl(var(--primary) / 0.3)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ 
            scale: 1.1,
            borderColor: "hsl(var(--primary))"
          }}
        >
          {/* Rotating border accent */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, hsl(var(--primary)), transparent 50%, hsl(var(--primary))) border-box"
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.svg 
            viewBox="0 0 24 24" 
            className="w-12 h-12 sm:w-14 sm:h-14 relative z-10"
            style={{ filter: "drop-shadow(0 0 15px hsl(var(--primary) / 0.6))" }}
            animate={{ 
              filter: [
                "drop-shadow(0 0 15px hsl(var(--primary) / 0.6))",
                "drop-shadow(0 0 25px hsl(var(--primary) / 0.8))",
                "drop-shadow(0 0 15px hsl(var(--primary) / 0.6))"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
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
          </motion.svg>
        </motion.div>
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
